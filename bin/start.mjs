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
 *   pnpm start:fyllut:mocks
 *   pnpm start:bygger:mocks
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

const loopbackHosts = ['127.0.0.1', 'localhost', '::1'];

const canConnectToPort = (port, host) =>
  new Promise((resolve) => {
    const socket = connect(port, host);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
  });

const waitForPort = (port, timeout = 60000) =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const attempt = async () => {
      for (const host of loopbackHosts) {
        if (await canConnectToPort(port, host)) {
          resolve(host);
          return;
        }
      }

      if (Date.now() - start > timeout) {
        reject(new Error(`Port ${port} not ready after ${timeout}ms`));
        return;
      }

      setTimeout(() => void attempt(), 250);
    };

    void attempt();
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
      getSummaryLines: ([mockHost, , backendHost, frontendHost]) => [
        `FYLLUT_MOCK_URL=http://${mockHost}:${mockPort}`,
        `FYLLUT_MOCK_ADMIN_PORT=${mockAdminPort}`,
        `FYLLUT_BACKEND_URL=http://${backendHost}:${backendPort}`,
        `FYLLUT_FRONTEND_URL=http://${frontendHost}:${frontendPort}/fyllut`,
      ],
      onReady: shouldWriteRuntimeConfig
        ? ([, , , frontendHost]) => {
            mkdirSync(resolve(repoRoot, 'packages/fyllut/.runtime'), { recursive: true });
            writeFileSync(
              fyllutCypressRuntimePath,
              JSON.stringify(
                {
                  baseUrl: `http://${frontendHost}:${frontendPort}`,
                  env: {
                    SKJEMABYGGING_PROXY_URL: `${mockUrl}/skjemabygging-proxy`,
                    AZURE_OPENID_CONFIG_TOKEN_ENDPOINT: `${mockUrl}/azure-openid/oauth2/v2.0/token`,
                    FORMIO_PROJECT_URL: `${mockUrl}/formio-api`,
                    MOCKS_ADMIN_PORT: String(mockAdminPort),
                    SEND_INN_HOST: `${mockUrl}/send-inn`,
                    SEND_INN_FRONTEND: `${mockUrl}/send-inn-frontend`,
                    TOKEN_X_WELL_KNOWN_URL: `${mockUrl}/tokenx/.well-known`,
                    BASE_URL: `http://${frontendHost}:${frontendPort}`,
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
      getSummaryLines: ([backendHost, frontendHost]) => [
        `BYGGER_BACKEND_URL=http://${backendHost}:${backendPort}`,
        `BYGGER_FRONTEND_URL=http://${frontendHost}:${frontendPort}`,
      ],
      onReady: shouldWriteRuntimeConfig
        ? ([, frontendHost]) => {
            mkdirSync(resolve(repoRoot, 'packages/bygger/.runtime'), { recursive: true });
            writeFileSync(
              byggerCypressRuntimePath,
              JSON.stringify(
                {
                  baseUrl: `http://${frontendHost}:${frontendPort}`,
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

const { commands, ports, getSummaryLines, onReady, onCleanup } = await configs[target]();

const spawnProcess = (cmd, args, env = {}, cwd = repoRoot) => {
  const options = {
    stdio: 'inherit',
    shell: false,
    cwd,
    env: { ...process.env, ...env },
  };

  if (isWindows && (cmd.endsWith('.cmd') || cmd.endsWith('.bat'))) {
    return spawn(process.env.comspec || 'cmd.exe', ['/d', '/s', '/c', cmd, ...args], options);
  }

  return spawn(cmd, args, options);
};

const procs = commands.map(([cmd, args, env = {}, cwd = repoRoot]) => spawnProcess(cmd, args, env, cwd));

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
Promise.all(ports.map((p) => waitForPort(p))).then((readyHosts) => {
  onReady?.(readyHosts);
  console.log('');
  console.log(getSummaryLines(readyHosts).join('\n'));
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
