import { randomUUID } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createFyllutTestStack } from '../lib/fyllut-test-stack.mjs';
import { startManagedStack } from '../lib/managed-test-stack.mjs';

const root = resolve(import.meta.dirname, '../..');
const checkBuild = (mode) => {
  if (mode !== 'built') return;
  for (const file of ['packages/fyllut/dist/index.html', 'packages/fyllut-backend/dist/server.mjs']) {
    if (!existsSync(resolve(root, file))) throw new Error(`BUILD_REQUIRED: ${file}; run pnpm build:fyllut`);
  }
};

const startTestEpoch = async ({ mode, testId, attempt, output, signal }) => {
  if (!['dev', 'built'].includes(mode)) throw new Error(`Invalid execution mode: ${mode}`);
  const fatalFile = resolve(output, 'fatal-cleanup.txt');
  if (existsSync(fatalFile)) throw new Error('PREVIOUS_EPOCH_FAILED: refusing to start another stack');
  checkBuild(mode);
  const epochId = randomUUID();
  const directory = resolve(output, 'epochs', epochId);
  mkdirSync(directory, { recursive: true });
  const epoch = { epochId, testId, attempt };
  const plan = createFyllutTestStack({
    repoRoot: root,
    ports: [3440, 3441, 3442, 3443],
    shouldWriteRuntimeConfig: false,
    mode,
    epoch: JSON.stringify(epoch),
  });
  const startedAt = Date.now();
  const fatal = (error) => writeFileSync(fatalFile, `${error.message}\n`);
  const stack = await startManagedStack(plan, {
    signal,
    log: (chunk) => appendFileSync(resolve(directory, 'stack.log'), chunk),
    onFailure: fatal,
  }).catch((error) => {
    fatal(error);
    throw error;
  });
  const manifest = {
    ...epoch,
    mode,
    pids: stack.pids,
    startupMs: Date.now() - startedAt,
    baseURL: `http://127.0.0.1:${mode === 'built' ? 3442 : 3443}`,
    mockURL: 'http://127.0.0.1:3440',
    adminURL: 'http://127.0.0.1:3441',
  };
  const manifestPath = resolve(directory, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return {
    ...manifest,
    directory,
    fatal,
    assertHealthy: stack.assertHealthy,
    stop: async () => {
      try {
        await stack.stop();
        writeFileSync(manifestPath, JSON.stringify({ ...manifest, stoppedAt: new Date().toISOString() }, null, 2));
      } catch (error) {
        fatal(error);
        throw error;
      }
    },
  };
};

export { checkBuild, startTestEpoch };
