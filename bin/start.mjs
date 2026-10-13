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
import { startFyllutTestStack } from './lib/fyllut-test-stack.mjs';
import { isPortFree, startManagedStack } from './lib/managed-test-stack.mjs';
import { parsePortRange, parsePorts } from './lib/test-ports.mjs';

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
const unknownArgs = [];
let ports;
let portRange;
for (let index = 0; index < normalizedArgs.length; index++) {
  const argument = normalizedArgs[index];
  if (argument === '--no-runtime-config') continue;
  if (target === 'fyllut' && ['--ports', '--port-range'].includes(argument)) {
    if (!normalizedArgs[index + 1]) throw new Error(`${argument} needs a value`);
    if (argument === '--ports') {
      if (ports) throw new Error('Duplicate --ports');
      ports = parsePorts(normalizedArgs[++index]);
    } else {
      if (portRange) throw new Error('Duplicate --port-range');
      portRange = parsePortRange(normalizedArgs[++index]);
    }
  } else unknownArgs.push(argument);
}
if (ports && portRange) throw new Error('TEST_PORT_OPTIONS_CONFLICT');

const configs = {
  fyllut: async () => {
    return {
      repoRoot,
      shouldWriteRuntimeConfig,
      ports,
      portRange,
    };
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
          [
            rootViteCliPath,
            '--clearScreen',
            'false',
            '--strictPort',
            '--host',
            '127.0.0.1',
            '--port',
            String(backendPort),
          ],
          { NODE_ENV: 'development' },
          resolve(repoRoot, 'packages/bygger-backend'),
        ],
        [
          nodeExecutable,
          [
            rootViteCliPath,
            '--clearScreen',
            'false',
            '--strictPort',
            '--host',
            '127.0.0.1',
            '--port',
            String(frontendPort),
          ],
          { BACKEND_PORT: String(backendPort), NODE_ENV: 'development' },
          resolve(repoRoot, 'packages/bygger'),
        ],
      ],
      healthUrls: [`${backendUrl}/internal/isReady`, frontendUrl],
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
  console.error(
    'Usage: node bin/start.mjs <fyllut|bygger> [--no-runtime-config] [--ports a,b,c,d | --port-range min:max (fyllut)]',
  );
  process.exit(1);
}

const config = await configs[target]();
const controller = new AbortController();
let stack;
let starting;
let shutdownPromise;
const shutdown = (code) => {
  controller.abort(new Error('STACK_INTERRUPTED'));
  shutdownPromise ??= (async () => {
    try {
      await starting;
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
starting = (async () => {
  try {
    stack = await (target === 'fyllut' ? startFyllutTestStack : startManagedStack)(config, {
      signal: controller.signal,
      onFailure: (error) => {
        console.error(error);
        void shutdown(1);
      },
    });
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
})();
await starting;
if (shutdownPromise) {
  await shutdownPromise;
} else if (!stack) {
  await shutdown(1);
} else {
  console.log(`\n${(stack.summaryLines ?? config.summaryLines).join('\n')}`);
  console.log(`START_PID=${process.pid}`);
}
