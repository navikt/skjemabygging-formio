import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { relative, resolve } from 'node:path';
import { isPortFree } from '../lib/managed-test-stack.mjs';
import { checkMigration, checkSourceSet, expandRuntimeCases } from './check-migration.mjs';
import { cypressMeasurements, formatMeasurements, measurementCases, playwrightMeasurements } from './measurements.mjs';
import { verifyEvidence } from './mock-evidence.mjs';
import { checkBuild, startTestEpoch } from './test-epoch.mjs';

const root = resolve(import.meta.dirname, '../..');
const args = process.argv.slice(2).filter((arg) => arg !== '--');
let repetitions = 1;
let output = resolve(root, 'packages/fyllut/.runtime/playwright-measurements', `${Date.now()}-${process.pid}`);
for (let index = 0; index < args.length; index++) {
  if (args[index] === '--repetitions') {
    assert(['1', '3'].includes(args[index + 1]), 'MEASUREMENT_REPETITIONS: use 1 or 3');
    repetitions = Number(args[++index]);
  } else if (args[index] === '--output') {
    assert(args[index + 1], '--output needs a directory');
    output = resolve(args[++index]);
  } else throw new Error(`Unsupported measurement argument: ${args[index]}`);
}
assert(!existsSync(output), 'MEASUREMENT_OUTPUT_EXISTS: use a fresh directory');
mkdirSync(output, { recursive: true });
const json = (path) => JSON.parse(readFileSync(path, 'utf8'));
const sha256 = (text) => createHash('sha256').update(text).digest('hex');
const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
const source = () => ({
  commit: git(['rev-parse', 'HEAD']).trim(),
  diffSha256: sha256(git(['diff', 'HEAD', '--'])),
  untracked: git(['ls-files', '--others', '--exclude-standard']).trim(),
  build: checkBuild('built').map((file) => ({ file: relative(root, file), sha256: sha256(readFileSync(file)) })),
});
const inventory = json(resolve(root, 'packages/fyllut/playwright/migration/inventory.json'));
checkSourceSet(inventory);
const cases = measurementCases(expandRuntimeCases(checkMigration(inventory)));
const originalSource = source();
assert.equal(originalSource.untracked, '', 'MEASUREMENT_UNTRACKED_SOURCE: stage new files first');
const runtimePath = resolve(root, 'packages/fyllut/.runtime/cypress.mocks.json');
const runtime = () => (existsSync(runtimePath) ? readFileSync(runtimePath, 'utf8') : null);
const originalRuntime = runtime();
const controller = new AbortController();
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, () => controller.abort(new Error(`MEASUREMENT_INTERRUPTED: ${signal}`)));
const verifySource = () => {
  controller.signal.throwIfAborted();
  assert.deepEqual(source(), originalSource, 'MEASUREMENT_SOURCE_OR_BUILD_CHANGED');
  assert.equal(runtime(), originalRuntime, 'MEASUREMENT_CYPRESS_RUNTIME_CHANGED');
};
const summary = {
  status: 'running',
  source: originalSource,
  selectedIds: cases.map(({ id }) => id),
  repetitions,
  environment: {
    runnerClass: process.env.FYLLUT_CI_RUNNER_CLASS ?? 'local',
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    githubRunId: process.env.GITHUB_RUN_ID,
    githubRunAttempt: process.env.GITHUB_RUN_ATTEMPT,
  },
  policy: { viewport: [1280, 1000], retries: 0, workers: 1, build: 'shared immutable built entrypoints' },
  comparisons: [],
};
const save = () => {
  writeFileSync(resolve(output, 'summary.json'), JSON.stringify(summary, null, 2));
  writeFileSync(resolve(output, 'summary.md'), formatMeasurements(summary));
};
const stoppedEpochs = async (directory) => {
  assert(!existsSync(resolve(directory, 'fatal-cleanup.txt')), 'MEASUREMENT_FATAL_CLEANUP');
  const epochs = readdirSync(resolve(directory, 'epochs')).map((id) => {
    const path = resolve(directory, 'epochs', id);
    return { manifest: json(resolve(path, 'manifest.json')), path };
  });
  for (const { manifest, path } of epochs) {
    assert.equal(manifest.state, 'stopped', 'MEASUREMENT_EPOCH_NOT_STOPPED');
    assert(manifest.stoppedAt, 'MEASUREMENT_EPOCH_ACTIVE');
    for (const pid of new Set([
      manifest.ownerPid,
      ...manifest.pids,
      ...manifest.startupAttempts.flatMap(({ pids }) => pids),
    ]))
      assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' }, `MEASUREMENT_PID_ALIVE: ${pid}`);
    for (const port of manifest.ports.slice(0, 3)) assert(await isPortFree(port), `MEASUREMENT_PORT_BUSY: ${port}`);
    if (manifest.testId === 'F061-T004')
      verifyEvidence(json(resolve(path, 'mock-evidence.json')), manifest, {
        'post-familie-pdf': 'success-tc07',
        'post-digital-soknad': 'success-tc07',
      });
  }
  return epochs;
};
const runPlaywright = async (iteration) => {
  verifySource();
  const started = performance.now();
  let log = '';
  const targets = [...new Set(cases.map(({ target }) => target))];
  const child = spawn(process.execPath, [resolve(import.meta.dirname, 'run-fyllut.mjs'), '--built', ...targets], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const abort = () => child.kill('SIGTERM');
  controller.signal.addEventListener('abort', abort, { once: true });
  try {
    for (const stream of [child.stdout, child.stderr])
      stream.on('data', (chunk) => {
        log += chunk;
        process.stdout.write(chunk);
      });
    const code = await new Promise((done, fail) => {
      child.once('error', fail);
      child.once('close', done);
    });
    assert.equal(code, 0, 'MEASUREMENT_PLAYWRIGHT_FAILED');
  } finally {
    controller.signal.removeEventListener('abort', abort);
    writeFileSync(resolve(output, `playwright-${iteration}.log`), log);
  }
  const wallMs = performance.now() - started;
  const directory = log.match(/^PLAYWRIGHT_ARTIFACTS=(.+)$/m)?.[1];
  assert(directory, 'MEASUREMENT_PLAYWRIGHT_REPORT_MISSING');
  const epochs = await stoppedEpochs(directory);
  const measurements = playwrightMeasurements(
    cases,
    json(resolve(directory, 'results.json')),
    epochs.map(({ manifest, path }) => ({ manifest, timings: json(resolve(path, 'timings.json')) })),
    wallMs,
  );
  verifySource();
  return measurements;
};
const runCypress = async (iteration) => {
  verifySource();
  const directory = resolve(output, `cypress-${iteration}`);
  mkdirSync(directory);
  const started = performance.now();
  const epoch = await startTestEpoch({
    mode: 'built',
    testId: `cypress-measurement-${iteration}`,
    attempt: 0,
    output: directory,
    observeMocks: false,
    portRange: [3440, 3499],
    signal: controller.signal,
  });
  let result;
  let executionMs;
  let teardownMs;
  const startupMs = performance.now() - started;
  try {
    assert.equal((await fetch(`${epoch.backendURL}/fyllut/internal/isready`)).status, 200);
    process.env.XDG_CONFIG_HOME = resolve(root, 'packages/fyllut/.cypress-home');
    const cypress = createRequire(resolve(root, 'packages/fyllut/package.json'))('cypress');
    const executionStarted = performance.now();
    result = await cypress.run({
      project: resolve(root, 'packages/fyllut'),
      spec: [...new Set(cases.map(({ source }) => resolve(root, source)))].join(','),
      browser: 'electron',
      config: { baseUrl: epoch.baseURL, retries: 0, viewportWidth: 1280, viewportHeight: 1000 },
      env: {
        MOCKS_ADMIN_PORT: epoch.ports[1],
        INCLUDE_DIST_TESTS: true,
        SKJEMABYGGING_PROXY_URL: `${epoch.mockURL}/skjemabygging-proxy`,
        AZURE_OPENID_CONFIG_TOKEN_ENDPOINT: `${epoch.mockURL}/azure-openid/oauth2/v2.0/token`,
        FORMIO_PROJECT_URL: `${epoch.mockURL}/formio-api`,
        SEND_INN_HOST: `${epoch.mockURL}/send-inn`,
        SEND_INN_FRONTEND: `${epoch.mockURL}/send-inn-frontend`,
        TOKEN_X_WELL_KNOWN_URL: `${epoch.mockURL}/tokenx/.well-known`,
        BASE_URL: epoch.baseURL,
        FAMILIE_PDF_GENERATOR_URL: epoch.mockURL,
      },
    });
    executionMs = performance.now() - executionStarted;
  } finally {
    const teardownStarted = performance.now();
    await epoch.stop();
    teardownMs = performance.now() - teardownStarted;
  }
  const wallMs = performance.now() - started;
  await stoppedEpochs(directory);
  verifySource();
  return cypressMeasurements(cases, result, root, { wallMs, startupMs, executionMs, teardownMs });
};

console.log(`PLAYWRIGHT_MEASUREMENTS=${output}`);
save();
try {
  for (let iteration = 1; iteration <= repetitions; iteration++) {
    const order = iteration % 2 ? ['playwright', 'cypress'] : ['cypress', 'playwright'];
    const comparison = { iteration, order };
    for (const framework of order) {
      comparison[framework] = await (framework === 'playwright' ? runPlaywright(iteration) : runCypress(iteration));
      summary.current = { iteration, completedFramework: framework };
      save();
    }
    summary.comparisons.push(comparison);
    delete summary.current;
    save();
  }
  verifySource();
  summary.status = 'passed';
  save();
} catch (error) {
  summary.status = 'failed';
  summary.failure = String(error);
  save();
  console.error(error);
  process.exitCode = 1;
}
