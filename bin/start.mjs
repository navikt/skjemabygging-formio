#!/usr/bin/env node
/**
 * Starts fyllut or bygger on automatically allocated free ports.
 * Designed for sub-agents and CI environments where default ports may be occupied.
 *
 * Usage:
 *   node bin/start.mjs fyllut
 *   node bin/start.mjs bygger
 *   node bin/start.mjs fyllut --no-runtime-config
 *   node bin/start.mjs bygger --no-runtime-config
 *
 *   yarn start:fyllut:auto
 *   yarn start:bygger:auto
 *
 * Output (printed after servers are ready, easy to parse):
 *   START_PID=12345
 *   FYLLUT_MOCK_URL=http://127.0.0.1:3000
 *   FYLLUT_MOCK_ADMIN_PORT=3310
 *   FYLLUT_BACKEND_URL=http://127.0.0.1:3001
 *   FYLLUT_FRONTEND_URL=http://127.0.0.1:3002
 */

import { spawn } from 'child_process';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { connect, createServer } from 'net';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const isPortFree = (port) =>
  new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, '127.0.0.1');
  });

const waitForPort = (port, timeout = 60000) =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const attempt = () => {
      const socket = connect(port, '127.0.0.1');
      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - start > timeout) return reject(new Error(`Port ${port} not ready after ${timeout}ms`));
        setTimeout(attempt, 250);
      });
    };
    attempt();
  });

const getFreePorts = async (count, start = 3440) => {
  const ports = [];
  let port = start;
  while (ports.length < count) {
    if (await isPortFree(port)) ports.push(port);
    port++;
  }
  return ports;
};

const isWindows = process.platform === 'win32';
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const localBin = (cwd, name) => resolve(cwd, 'node_modules', '.bin', isWindows ? `${name}.cmd` : name);
const byggerCypressRuntimePath = resolve(repoRoot, 'packages/bygger/.runtime/cypress.mocks.json');
const fyllutCypressRuntimePath = resolve(repoRoot, 'packages/fyllut/.runtime/cypress.mocks.json');
const [target, ...args] = process.argv.slice(2);
const shouldWriteRuntimeConfig = !args.includes('--no-runtime-config');
const unknownArgs = args.filter((arg) => arg !== '--no-runtime-config');

const configs = {
  fyllut: async () => {
    const [mockPort, mockAdminPort, backendPort, frontendPort] = await getFreePorts(4);
    const mockUrl = `http://127.0.0.1:${mockPort}`;
    const backendUrl = `http://127.0.0.1:${backendPort}`;
    const frontendUrl = `http://127.0.0.1:${frontendPort}/fyllut`;
    const fyllutBackendEnv = {
      NODE_ENV: 'development',
      MOCKS_ENABLED: 'true',
      SKJEMABYGGING_PROXY_URL: `${mockUrl}/skjemabygging-proxy`,
      AZURE_OPENID_CONFIG_TOKEN_ENDPOINT: `${mockUrl}/azure-openid/oauth2/v2.0/token`,
      FORMIO_API_SERVICE: mockUrl,
      FORMS_API_URL: `${mockUrl}/forms-api`,
      SEND_INN_HOST: `${mockUrl}/send-inn`,
      TILLEGGSSTONADER_HOST: `${mockUrl}/register-data`,
      KODEVERK_URL: `${mockUrl}/kodeverk`,
      TOKEN_X_WELL_KNOWN_URL: `${mockUrl}/tokenx/.well-known`,
      FAMILIE_PDF_GENERATOR_URL: mockUrl,
      TEAM_LOGS_URL: `${mockUrl}/team-logs`,
    };
    return {
      commands: [
        [
          localBin(resolve(repoRoot, 'mocks'), 'ts-node'),
          [
            'mocks/server.ts',
            '--no-plugins.inquirerCli.enabled',
            `--server.port=${mockPort}`,
            `--plugins.adminApi.port=${mockAdminPort}`,
          ],
          {},
          resolve(repoRoot, 'mocks'),
        ],
        [
          localBin(repoRoot, 'vite'),
          ['--clearScreen', 'false', '--port', String(backendPort)],
          fyllutBackendEnv,
          resolve(repoRoot, 'packages/fyllut-backend'),
        ],
        [
          localBin(repoRoot, 'vite'),
          ['--clearScreen', 'false', '--port', String(frontendPort)],
          { BACKEND_PORT: String(backendPort), NODE_ENV: 'development' },
          resolve(repoRoot, 'packages/fyllut'),
        ],
      ],
      ports: [mockPort, mockAdminPort, backendPort, frontendPort],
      summaryLines: [
        `FYLLUT_MOCK_URL=${mockUrl}`,
        `FYLLUT_MOCK_ADMIN_PORT=${mockAdminPort}`,
        `FYLLUT_BACKEND_URL=${backendUrl}`,
        `FYLLUT_FRONTEND_URL=${frontendUrl}`,
      ],
      onReady: shouldWriteRuntimeConfig
        ? () => {
            mkdirSync(resolve(repoRoot, 'packages/fyllut/.runtime'), { recursive: true });
            writeFileSync(
              fyllutCypressRuntimePath,
              JSON.stringify(
                {
                  baseUrl: `http://127.0.0.1:${frontendPort}`,
                  env: {
                    SKJEMABYGGING_PROXY_URL: `${mockUrl}/skjemabygging-proxy`,
                    AZURE_OPENID_CONFIG_TOKEN_ENDPOINT: `${mockUrl}/azure-openid/oauth2/v2.0/token`,
                    FORMIO_PROJECT_URL: `${mockUrl}/formio-api`,
                    MOCKS_ADMIN_PORT: String(mockAdminPort),
                    SEND_INN_HOST: `${mockUrl}/send-inn`,
                    SEND_INN_FRONTEND: `${mockUrl}/send-inn-frontend`,
                    TOKEN_X_WELL_KNOWN_URL: `${mockUrl}/tokenx/.well-known`,
                    BASE_URL: `http://127.0.0.1:${frontendPort}`,
                    FAMILIE_PDF_GENERATOR_URL: mockUrl,
                  },
                },
                null,
                2,
              ),
            );
          }
        : undefined,
      onCleanup: shouldWriteRuntimeConfig ? () => rmSync(fyllutCypressRuntimePath, { force: true }) : undefined,
    };
  },
  bygger: async () => {
    const [backendPort, frontendPort] = await getFreePorts(2);
    const backendUrl = `http://127.0.0.1:${backendPort}`;
    const frontendUrl = `http://127.0.0.1:${frontendPort}`;
    return {
      commands: [
        [
          localBin(repoRoot, 'vite'),
          ['--clearScreen', 'false', '--port', String(backendPort)],
          { NODE_ENV: 'development' },
          resolve(repoRoot, 'packages/bygger-backend'),
        ],
        [
          localBin(repoRoot, 'vite'),
          ['--clearScreen', 'false', '--port', String(frontendPort)],
          { BACKEND_PORT: String(backendPort), NODE_ENV: 'development' },
          resolve(repoRoot, 'packages/bygger'),
        ],
      ],
      ports: [backendPort, frontendPort],
      summaryLines: [`BYGGER_BACKEND_URL=${backendUrl}`, `BYGGER_FRONTEND_URL=${frontendUrl}`],
      onReady: shouldWriteRuntimeConfig
        ? () => {
            mkdirSync(resolve(repoRoot, 'packages/bygger/.runtime'), { recursive: true });
            writeFileSync(
              byggerCypressRuntimePath,
              JSON.stringify(
                {
                  baseUrl: frontendUrl,
                },
                null,
                2,
              ),
            );
          }
        : undefined,
      onCleanup: shouldWriteRuntimeConfig ? () => rmSync(byggerCypressRuntimePath, { force: true }) : undefined,
    };
  },
};

if (!configs[target] || unknownArgs.length > 0) {
  console.error(`Usage: node bin/start.mjs <fyllut|bygger> [--no-runtime-config]`);
  process.exit(1);
}

const { commands, ports, summaryLines, onReady, onCleanup } = await configs[target]();

const opts = { stdio: 'inherit', shell: false };
const procs = commands.map(([cmd, args, env = {}, cwd = repoRoot]) =>
  spawn(cmd, args, { ...opts, cwd, env: { ...process.env, ...env } }),
);

const killProcess = (pid, signal) =>
  new Promise((resolve) => {
    if (!pid) {
      resolve();
      return;
    }

    if (isWindows) {
      const killer = spawn('taskkill', ['/pid', String(pid), '/t', '/f'], { stdio: 'ignore', shell: false });
      killer.once('exit', () => resolve());
      killer.once('error', () => resolve());
      return;
    }

    try {
      process.kill(pid, signal);
    } catch {
      /* already gone */
    }
    resolve();
  });

let shuttingDown = false;
const shutdown = async (signal, code = 0) => {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  await Promise.all(procs.map((p) => killProcess(p.pid, signal)));
  onCleanup?.();
  process.exit(code);
};

process.on('SIGINT', () => void shutdown('SIGINT', 130));
process.on('SIGTERM', () => void shutdown('SIGTERM', 143));

// Wait for all ports to accept connections, then signal readiness
Promise.all(ports.map((p) => waitForPort(p))).then(() => {
  onReady?.();
  console.log('');
  console.log(summaryLines.join('\n'));
  console.log(`START_PID=${process.pid}`);
});

let exitCode = 0;
let exited = 0;
procs.forEach((p) => {
  p.on('exit', (code) => {
    exitCode = exitCode || code || 0;
    if (++exited === procs.length) {
      onCleanup?.();
      process.exit(exitCode);
    }
  });
});
