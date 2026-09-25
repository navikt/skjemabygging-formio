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
 *   FYLLUT_MOCK_URL=http://127.0.0.1:3000
 *   FYLLUT_MOCK_ADMIN_PORT=3310
 *   FYLLUT_BACKEND_URL=http://127.0.0.1:3001
 *   FYLLUT_FRONTEND_URL=http://127.0.0.1:3002/fyllut
 *   START_PID=12345
 */

import { spawn } from 'child_process';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { get } from 'http';
import { createServer } from 'net';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createFyllutTestStack } from './lib/fyllut-test-stack.mjs';

const isPortFree = (port) =>
  new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });

const canRespond = (url) =>
  new Promise((resolve) => {
    const request = get(url, (response) => {
      const healthy = response.statusCode >= 200 && response.statusCode < 300;
      response.destroy();
      resolve(healthy);
    });
    request.setTimeout(1000, () => request.destroy());
    request.once('error', () => resolve(false));
  });

const waitForHealth = async (url, timeout = 60000) => {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await canRespond(url)) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`${url} not ready after ${timeout}ms`);
};

const waitForListeningPorts = async (ports, timeout = 60000) => {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (ports.every((childPorts) => childPorts.size === 0)) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(
    `Servers did not confirm listening on ports: ${ports.flatMap((childPorts) => [...childPorts]).join(', ')}`,
  );
};

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
const nodeExecutable = process.execPath;
const rootViteCliPath = resolve(repoRoot, 'node_modules/vite/bin/vite.js');
const byggerCypressRuntimePath = resolve(repoRoot, 'packages/bygger/.runtime/cypress.mocks.json');
const [target, ...args] = process.argv.slice(2);
const normalizedArgs = args.filter((arg) => arg !== '--');
const shouldWriteRuntimeConfig = !normalizedArgs.includes('--no-runtime-config');
const unknownArgs = normalizedArgs.filter((arg) => arg !== '--no-runtime-config');

const configs = {
  fyllut: async () => {
    return createFyllutTestStack({
      repoRoot,
      ports: await getFreePorts(4),
      shouldWriteRuntimeConfig,
    });
  },
  bygger: async () => {
    const [backendPort, frontendPort] = await getFreePorts(2);
    const backendUrl = `http://127.0.0.1:${backendPort}`;
    const frontendUrl = `http://127.0.0.1:${frontendPort}`;
    let runtimeWritten = false;
    return {
      commands: [
        [
          nodeExecutable,
          [rootViteCliPath, '--clearScreen', 'false', '--strictPort', '--port', String(backendPort)],
          { NODE_ENV: 'development' },
          resolve(repoRoot, 'packages/bygger-backend'),
        ],
        [
          nodeExecutable,
          [rootViteCliPath, '--clearScreen', 'false', '--strictPort', '--port', String(frontendPort)],
          { BACKEND_PORT: String(backendPort), NODE_ENV: 'development' },
          resolve(repoRoot, 'packages/bygger'),
        ],
      ],
      healthUrls: [backendUrl, frontendUrl],
      listeningPorts: [[backendPort], [frontendPort]],
      summaryLines: [`BYGGER_BACKEND_URL=${backendUrl}`, `BYGGER_FRONTEND_URL=${frontendUrl}`],
      onReady: shouldWriteRuntimeConfig
        ? () => {
            mkdirSync(resolve(repoRoot, 'packages/bygger/.runtime'), { recursive: true });
            runtimeWritten = true;
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
      onCleanup: shouldWriteRuntimeConfig
        ? () => {
            if (runtimeWritten) rmSync(byggerCypressRuntimePath, { force: true });
          }
        : undefined,
    };
  },
};

if (!configs[target] || unknownArgs.length > 0) {
  console.error(`Usage: node bin/start.mjs <fyllut|bygger> [--no-runtime-config]`);
  process.exit(1);
}

const { commands, healthUrls, listeningPorts, summaryLines, onReady, onCleanup } = await configs[target]();
const ports = listeningPorts.flat();
if (!(await Promise.all(ports.map((port) => isPortFree(port)))).every(Boolean)) {
  throw new Error(`Port collision before startup: ${ports.join(', ')}`);
}

const procs = [];
const pendingPorts = listeningPorts.map((childPorts) => new Set(childPorts));
let startupFailure;
const failedToStart = new Promise((_, reject) => {
  startupFailure = reject;
});
let ready = false;
let shuttingDown = false;

const shutdown = async (signal, code = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  await Promise.all(procs.map((p) => killProcess(p.pid, signal)));
  try {
    onCleanup?.();
  } catch (error) {
    console.error(error);
    code = 1;
  }
  process.exit(code);
};

for (const [index, [cmd, args, env = {}, cwd = repoRoot]] of commands.entries()) {
  const child = spawn(cmd, args, {
    stdio: ['inherit', 'pipe', 'inherit'],
    shell: false,
    detached: !isWindows,
    cwd,
    env: { ...process.env, ...env },
  });
  procs.push(child);
  let bufferedOutput = '';
  child.stdout.on('data', (chunk) => {
    process.stdout.write(chunk);
    bufferedOutput += chunk.toString();
    const lines = bufferedOutput.split(/\r?\n/);
    bufferedOutput = lines.pop();
    for (const rawLine of lines) {
      // Vite colors its URL output when stdout is a terminal.
      // eslint-disable-next-line no-control-regex
      const line = rawLine.replace(/\x1b\[[0-9;]*m/g, '');
      const match =
        index === 0 && target === 'fyllut'
          ? line.match(/Server started and listening at https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\]):(\d+)/)
          : line.match(/Local:\s+https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\]):(\d+)/);
      if (!match) continue;
      const port = Number(match[1]);
      if (!listeningPorts[index].includes(port)) {
        startupFailure(new Error(`${cmd} listened on unexpected port ${port}`));
      } else {
        pendingPorts[index].delete(port);
      }
    }
  });
  child.once('error', (error) => {
    if (!ready) startupFailure(error);
    else void shutdown('SIGTERM', 1);
  });
  child.once('exit', (code, signal) => {
    const error = new Error(`${cmd} exited ${signal ? `with ${signal}` : `with code ${code}`} before shutdown`);
    if (!ready) startupFailure(error);
    else if (!shuttingDown) {
      console.error(error);
      void shutdown('SIGTERM', code || 1);
    }
  });
}

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
      process.kill(-pid, signal);
    } catch {
      /* already gone */
    }
    resolve();
  });

process.on('SIGINT', () => void shutdown('SIGINT', 130));
process.on('SIGTERM', () => void shutdown('SIGTERM', 143));

try {
  await Promise.race([
    Promise.all([...healthUrls.map((url) => waitForHealth(url)), waitForListeningPorts(pendingPorts)]),
    failedToStart,
  ]);
  if (shuttingDown) throw new Error('Startup interrupted');
  onReady?.();
  ready = true;
  console.log('');
  console.log(summaryLines.join('\n'));
  console.log(`START_PID=${process.pid}`);
} catch (error) {
  console.error(error);
  await shutdown('SIGTERM', 1);
}
