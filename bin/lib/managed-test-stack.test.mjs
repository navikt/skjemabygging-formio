/* eslint-disable vitest/no-import-node-test -- Standalone process lifecycle tests. */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { isPortFree, startManagedStack } from './managed-test-stack.mjs';

const port = 3440;
const url = `http://127.0.0.1:${port}`;
const config = (script, options = {}) => ({
  commands: [[process.execPath, ['--input-type=module', '-e', script], {}, process.cwd()]],
  listeningPorts: [[port]],
  healthUrls: [url],
  ...options,
});
const server = `import {createServer} from 'node:http'; createServer((req,res)=>res.end('owned')).listen(${port},'127.0.0.1');`;
const log = () => {};

test('owned bind, health, group exit and same-port reuse', async () => {
  for (let index = 0; index < 2; index++) {
    const stack = await startManagedStack(config(server), { log });
    assert.equal(await (await fetch(url)).text(), 'owned');
    await stack.stop();
    assert.equal(await isPortFree(port), true);
    assert.throws(() => process.kill(stack.pids[0], 0), { code: 'ESRCH' });
  }
});

test('foreign healthy listener is rejected and remains alive', async () => {
  const foreign = createServer((req, res) => res.end('foreign'));
  await new Promise((done) => foreign.listen(port, '127.0.0.1', done));
  try {
    await assert.rejects(startManagedStack(config(server), { log }), /STACK_PORT_COLLISION/);
    assert.equal(await (await fetch(url)).text(), 'foreign');
  } finally {
    await new Promise((done, fail) => foreign.close((error) => (error ? fail(error) : done())));
  }
});

test('early exit and readiness timeout fail and free the port', async () => {
  await assert.rejects(startManagedStack(config('process.exit(17)'), { log }), /STACK_CHILD_EXIT/);
  await assert.rejects(
    startManagedStack(config('setInterval(()=>{},1000)'), { log, timeoutMs: 200 }),
    /STACK_STARTUP_TIMEOUT/,
  );
  assert.equal(await isPortFree(port), true);
});

test('abort cancels startup and cleanup errors are not swallowed', async () => {
  await assert.rejects(
    startManagedStack(config('setInterval(()=>{},1000)'), {
      log,
      signal: AbortSignal.abort(new Error('controlled-abort')),
    }),
    /controlled-abort/,
  );
  const stack = await startManagedStack(
    config(server, {
      onCleanup: () => {
        throw new Error('controlled-cleanup');
      },
    }),
    { log },
  );
  await assert.rejects(stack.stop(), (error) => {
    assert.match(error.message, /STACK_CLEANUP_FAILED/);
    assert.equal(error.errors[0].message, 'controlled-cleanup');
    return true;
  });
  assert.equal(await isPortFree(port), true);
});

test('a child ignoring TERM is killed and its exit awaited', async () => {
  const stack = await startManagedStack(config(`${server} process.on('SIGTERM',()=>{});`), { log });
  await stack.stop();
  assert.equal(await isPortFree(port), true);
  assert.throws(() => process.kill(stack.pids[0], 0), { code: 'ESRCH' });
});
