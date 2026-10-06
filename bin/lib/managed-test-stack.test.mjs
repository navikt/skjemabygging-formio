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

test('abort during a successful readiness response rejects and awaits child exit', async () => {
  const controller = new AbortController();
  const pids = [];
  let release;
  let interrupted = false;
  const script = `
    import {createServer} from 'node:http';
    let pending;
    createServer((req, res) => {
      if (req.url === '/health') {
        pending = res;
        console.log('health-pending');
      } else {
        res.end('released');
        pending.end('healthy');
      }
    }).listen(${port}, '127.0.0.1');
  `;
  await assert.rejects(
    startManagedStack(config(script, { healthUrls: [`${url}/health`] }), {
      signal: controller.signal,
      onSpawn: (pid) => pids.push(pid),
      log: (chunk) => {
        if (chunk.toString().includes('health-pending') && !interrupted) {
          interrupted = true;
          controller.abort(new Error('readiness-aborted'));
          release = fetch(`${url}/release`);
        }
      },
    }),
    /readiness-aborted/,
  );
  assert.equal((await release).status, 200);
  assert(interrupted);
  assert.equal(await isPortFree(port), true);
  for (const pid of pids) assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
});

test('abort during onReady cleans up the runtime state before rejecting', async () => {
  const controller = new AbortController();
  const pids = [];
  let runtimeWritten = false;
  let cleaned = false;
  await assert.rejects(
    startManagedStack(
      config(server, {
        onReady: () => {
          runtimeWritten = true;
          controller.abort(new Error('ready-callback-aborted'));
        },
        onCleanup: () => {
          runtimeWritten = false;
          cleaned = true;
        },
      }),
      { log, signal: controller.signal, onSpawn: (pid) => pids.push(pid) },
    ),
    /ready-callback-aborted/,
  );
  assert(cleaned);
  assert.equal(runtimeWritten, false);
  assert.equal(await isPortFree(port), true);
  for (const pid of pids) assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
});

test('selected owned children stop while remaining services stay healthy', async () => {
  const stack = await startManagedStack(
    {
      commands: [
        [process.execPath, ['--input-type=module', '-e', server], {}, process.cwd()],
        [process.execPath, ['--input-type=module', '-e', server.replaceAll('3440', '3441')], {}, process.cwd()],
      ],
      listeningPorts: [[3440], [3441]],
      healthUrls: [url, 'http://127.0.0.1:3441'],
    },
    { log },
  );
  try {
    await assert.rejects(stack.stopChildren([process.pid]), /STACK_UNKNOWN_CHILD/);
    await stack.stopChildren([stack.pids[1]]);
    await stack.stopChildren([stack.pids[1]]);
    assert.throws(() => process.kill(stack.pids[1], 0), { code: 'ESRCH' });
    assert.equal(await (await fetch(url)).text(), 'owned');
    stack.assertHealthy();
    assert(await isPortFree(3441));
  } finally {
    await stack.stop();
  }
  assert(await isPortFree(port));
});
