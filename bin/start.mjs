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

import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createFyllutTestStack } from './lib/fyllut-test-stack.mjs';
import { isPortFree, startManagedStack } from './lib/managed-test-stack.mjs';

const getFreePorts = async (count, start = 3440) => {
  const ports = [];
  let port = start;
  while (ports.length < count) {
    if (await isPortFree(port)) ports.push(port);
    port++;
  }
  return ports;
};

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

const config = await configs[target]();
const controller = new AbortController();
let stack;
let shutdownPromise;
const shutdown = (code) => {
  controller.abort(new Error('STACK_INTERRUPTED'));
  shutdownPromise ??= (async () => {
    try {
      await stack?.stop();
      process.exitCode = code;
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    }
  })();
  return shutdownPromise;
};
process.on('SIGINT', () => void shutdown(130));
process.on('SIGTERM', () => void shutdown(143));
try {
  stack = await startManagedStack(config, {
    signal: controller.signal,
    onFailure: (error) => {
      console.error(error);
      void shutdown(1);
    },
  });
  console.log(`\n${config.summaryLines.join('\n')}`);
  console.log(`START_PID=${process.pid}`);
} catch (error) {
  console.error(error);
  await shutdown(1);
}
