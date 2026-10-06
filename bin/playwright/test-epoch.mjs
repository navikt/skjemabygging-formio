import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const checkBuild = (mode, repoRoot = root) => {
  if (mode !== 'built') return [];
  const files = ['packages/fyllut/dist/index.html', 'packages/fyllut-backend/dist/server.mjs'];
  for (const file of files) {
    if (!existsSync(resolve(repoRoot, file))) throw new Error(`BUILD_REQUIRED: ${file}; run pnpm build:fyllut`);
  }
  return files.map((file) => resolve(repoRoot, file));
};
const startTestEpoch = async ({ mode, testId, attempt, output, signal, observeMocks = true, mockFault }) => {
  if (!['dev', 'built'].includes(mode)) throw new Error(`Invalid execution mode: ${mode}`);
  if (attempt !== 0) throw new Error('EPOCH_RETRY_FORBIDDEN');
  const fatalFile = resolve(output, 'fatal-cleanup.txt');
  if (existsSync(fatalFile)) throw new Error('PREVIOUS_EPOCH_FAILED: refusing to start another stack');
  const epochs = resolve(output, 'epochs');
  for (const previous of existsSync(epochs) ? readdirSync(epochs) : []) {
    const path = resolve(epochs, previous, 'manifest.json');
    if (!existsSync(path)) throw new Error(`PREVIOUS_EPOCH_ACTIVE: ${previous}`);
    const manifest = JSON.parse(readFileSync(path, 'utf8'));
    if (!manifest.stoppedAt) throw new Error(`PREVIOUS_EPOCH_ACTIVE: ${previous}`);
    try {
      process.kill(manifest.ownerPid, 0);
    } catch (error) {
      if (error.code === 'ESRCH') continue;
      throw error;
    }
    throw new Error(`PREVIOUS_EPOCH_ACTIVE: owner ${manifest.ownerPid} has not exited`);
  }
  checkBuild(mode);
  signal?.throwIfAborted();
  const epochId = randomUUID();
  const directory = resolve(output, 'epochs', epochId);
  mkdirSync(directory, { recursive: true });
  const manifest = {
    epochId,
    testId,
    attempt,
    mode,
    baseURL: `http://127.0.0.1:${mode === 'built' ? 3442 : 3443}`,
    mockURL: 'http://127.0.0.1:3440',
    adminURL: 'http://127.0.0.1:3441',
  };
  const fd = openSync(resolve(directory, 'stack.log'), 'a');
  let owner;
  try {
    owner = spawn(process.execPath, [resolve(import.meta.dirname, 'epoch-owner.mjs')], {
      cwd: root,
      stdio: ['ignore', fd, fd, 'ipc'],
    });
  } finally {
    closeSync(fd);
  }
  let failure;
  let stopping;
  let quiescing;
  const fatal = (error) => {
    failure ??= error;
    writeFileSync(fatalFile, `${failure.message}\n`);
  };
  const exited = new Promise((done) => {
    owner.once('error', (error) => {
      fatal(error);
      done(1);
    });
    owner.once('exit', (code) => {
      if (!stopping) fatal(new Error(`EPOCH_OWNER_EXIT: ${code}`));
      done(code ?? 1);
    });
  });
  const stop = () => {
    stopping ??= (async () => {
      if (owner.connected)
        owner.send({ type: 'stop' }, (error) => {
          if (error) fatal(error);
        });
      const code = await exited;
      if (code !== 0) throw failure ?? new Error(`EPOCH_OWNER_EXIT: ${code}; see ${directory}`);
    })();
    return stopping;
  };
  const aborted = () => {
    fatal(new Error('EPOCH_INTERRUPTED'));
    void stop().catch(fatal);
  };
  signal?.addEventListener('abort', aborted, { once: true });
  try {
    const ready = await new Promise((done, fail) => {
      owner.on('message', (message) => {
        if (message?.type === 'error') {
          fatal(new Error(message.message));
          fail(failure);
        } else if (message?.type === 'ready') done(message.manifest);
      });
      void exited.then((code) => fail(failure ?? new Error(`EPOCH_OWNER_EXIT: ${code}; see ${directory}`)));
      owner.send({ type: 'start', manifest, directory, fatalFile, observeMocks, mockFault }, (error) => {
        if (error) {
          fatal(error);
          fail(error);
        }
      });
    });
    if (failure) throw failure;
    return {
      ...ready,
      directory,
      fatal,
      quiesce: () => {
        quiescing ??= new Promise((done, fail) => {
          const onMessage = (message) => {
            if (message?.type === 'quiesced') {
              owner.off('message', onMessage);
              done();
            } else if (message?.type === 'error') {
              owner.off('message', onMessage);
              fail(new Error(message.message));
            }
          };
          owner.on('message', onMessage);
          void exited.then(() => {
            owner.off('message', onMessage);
            fail(failure ?? new Error('EPOCH_OWNER_EXIT'));
          });
          owner.send({ type: 'quiesce' }, (error) => {
            if (error) {
              owner.off('message', onMessage);
              fatal(error);
              fail(error);
            }
          });
        });
        return quiescing;
      },
      assertHealthy: () => {
        if (failure) throw failure;
        if (existsSync(fatalFile)) throw new Error(readFileSync(fatalFile, 'utf8').trim());
        if (owner.exitCode !== null || owner.signalCode !== null) throw new Error('EPOCH_OWNER_EXIT');
      },
      stop: async () => {
        try {
          await stop();
        } finally {
          signal?.removeEventListener('abort', aborted);
        }
      },
    };
  } catch (error) {
    fatal(error);
    try {
      await stop();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        `EPOCH_START_AND_CLEANUP_FAILED: ${error.message}; ${cleanupError.message}`,
        { cause: cleanupError },
      );
    } finally {
      signal?.removeEventListener('abort', aborted);
    }
    throw error;
  }
};

export { checkBuild, startTestEpoch };
