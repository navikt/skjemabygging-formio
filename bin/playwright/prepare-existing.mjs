import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parsePortRange, parsePorts } from '../lib/test-ports.mjs';
import { checkMigration, checkSourceSet } from './check-migration.mjs';
import { repoRoot } from './existing-manifest.mjs';
import { prepareExistingEpoch } from './existing-owner.mjs';

const args = process.argv.slice(2).filter((arg) => arg !== '--');
const testId = args.shift();
let mode = 'dev';
let ports;
let portRange;
for (let index = 0; index < args.length; index++) {
  const argument = args[index];
  if (argument === '--built') mode = 'built';
  else if (argument === '--ports') {
    if (ports) throw new Error('Duplicate --ports');
    ports = parsePorts(args[++index] ?? '');
  } else if (argument === '--port-range') {
    if (portRange) throw new Error('Duplicate --port-range');
    portRange = parsePortRange(args[++index] ?? '');
  } else throw new Error(`Unsupported prepare argument: ${argument}`);
}
if (ports && portRange) throw new Error('TEST_PORT_OPTIONS_CONFLICT');
let prepared;
let interrupted;
const controller = new AbortController();
const shutdown = (signal) => {
  interrupted = signal;
  controller.abort(new Error('EXISTING_PREPARE_INTERRUPTED'));
  if (prepared)
    void prepared.close().catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
  process.exitCode = signal === 'SIGINT' ? 130 : 143;
};
process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
try {
  const inventory = JSON.parse(readFileSync(resolve(repoRoot, 'packages/fyllut/playwright/migration/inventory.json')));
  const selected = checkMigration(inventory).find((test) => test.id === testId);
  checkSourceSet(inventory);
  if (!selected) throw new Error(`EXISTING_UNKNOWN_TEST: ${testId}`);
  if (mode === 'dev' && testId === 'F086-T002') throw new Error('EXISTING_BUILD_ONLY_TEST');
  const output = resolve(repoRoot, 'packages/fyllut/.runtime/playwright', `existing-${randomUUID()}`);
  mkdirSync(output, { recursive: true });
  console.log(`PLAYWRIGHT_PREPARING_OUTPUT=${output}`);
  prepared = await prepareExistingEpoch(
    {
      mode,
      testId,
      output,
      ports,
      portRange,
      signal: controller.signal,
      manifestPath: resolve(output, 'existing.json'),
    },
    {
      onError: (error) => {
        console.error(error);
        process.exitCode = 1;
      },
    },
  );
  if (interrupted) await prepared.close();
  else console.log(`PLAYWRIGHT_EXISTING_MANIFEST=${prepared.manifestPath}\nSTART_PID=${process.pid}`);
} catch (error) {
  console.error(error);
  process.exitCode = interrupted === 'SIGINT' ? 130 : interrupted === 'SIGTERM' ? 143 : 1;
}
