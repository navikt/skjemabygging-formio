import { appendFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createFyllutTestStack } from '../lib/fyllut-test-stack.mjs';
import { startManagedStack } from '../lib/managed-test-stack.mjs';

const root = resolve(import.meta.dirname, '../..');
const controller = new AbortController();
let stack;
let starting;
let stopping;
let quiescing;
let manifest;
let directory;
let fatalFile;
let failure;
const fatal = (error) => {
  failure ??= error;
  if (fatalFile) writeFileSync(fatalFile, `${error.message}\n`);
};
const save = () => writeFileSync(resolve(directory, 'manifest.json'), JSON.stringify(manifest, null, 2));
const notify = (message) => {
  if (process.connected)
    process.send(message, (error) => {
      if (error && !stopping) void stop(new Error('EPOCH_OWNER_DISCONNECTED', { cause: error }));
    });
};
const quiesce = () => {
  quiescing ??= (async () => {
    await starting;
    if (!stack || stopping) throw new Error('EPOCH_NOT_READY');
    await stack.stopChildren(stack.pids.slice(1));
    manifest = { ...manifest, quiescedAt: new Date().toISOString() };
    save();
  })();
  return quiescing;
};
const stop = (error) => {
  if (error) fatal(error);
  stopping ??= (async () => {
    controller.abort(new Error('EPOCH_STOP_REQUESTED'));
    await starting;
    if (quiescing) {
      try {
        await quiescing;
      } catch (quiesceError) {
        fatal(quiesceError);
      }
    }
    try {
      await stack?.stop();
      if (manifest) {
        manifest = { ...manifest, state: failure ? 'failed' : 'stopped', stoppedAt: new Date().toISOString() };
        save();
      }
    } catch (cleanupError) {
      fatal(cleanupError);
      console.error(cleanupError);
    }
    if (failure) notify({ type: 'error', message: failure.message });
    process.exitCode = failure ? 1 : 0;
    if (process.connected) process.disconnect();
  })();
  return stopping;
};
process.once('disconnect', () => {
  if (!stopping) void stop(new Error('EPOCH_OWNER_DISCONNECTED'));
});
process.once('SIGTERM', () => void stop(new Error('EPOCH_OWNER_INTERRUPTED')));
process.once('SIGINT', () => void stop(new Error('EPOCH_OWNER_INTERRUPTED')));
process.on('message', (message) => {
  if (message?.type === 'quiesce') {
    void quiesce().then(
      () => notify({ type: 'quiesced' }),
      (error) => {
        fatal(error);
        notify({ type: 'error', message: error.message });
      },
    );
    return;
  }
  if (message?.type === 'stop') {
    void stop();
    return;
  }
  if (message?.type !== 'start' || starting || stopping) return;
  ({ manifest, directory, fatalFile } = message);
  manifest = { ...manifest, ownerPid: process.pid, pids: [], state: 'starting' };
  save();
  const startedAt = Date.now();
  starting = (async () => {
    try {
      const plan = createFyllutTestStack({
        repoRoot: root,
        ports: [3440, 3441, 3442, 3443],
        shouldWriteRuntimeConfig: false,
        mode: manifest.mode,
        epoch: JSON.stringify({ epochId: manifest.epochId, testId: manifest.testId, attempt: manifest.attempt }),
        observeMocks: message.observeMocks,
        mockFault: message.mockFault,
      });
      stack = await startManagedStack(plan, {
        signal: controller.signal,
        log: (chunk) => appendFileSync(resolve(directory, 'stack.log'), chunk),
        onFailure: (error) => {
          fatal(error);
          void stop(error);
        },
        onSpawn: (pid) => {
          manifest = { ...manifest, pids: [...manifest.pids, pid] };
          save();
        },
      });
      manifest = { ...manifest, state: 'ready', pids: stack.pids, startupMs: Date.now() - startedAt };
      save();
      if (!stopping) notify({ type: 'ready', manifest });
    } catch (error) {
      fatal(error);
      console.error(error);
      notify({ type: 'error', message: error.message });
    }
  })();
  void starting.then(() => {
    if (failure && !stopping) void stop();
  });
});
