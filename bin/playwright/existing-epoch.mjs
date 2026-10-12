import { mkdirSync, writeFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { loadExistingManifest } from './existing-manifest.mjs';

const attachExistingEpoch = async ({ manifestPath, mode, testId, attempt, output }) => {
  const manifest = loadExistingManifest(manifestPath);
  for (const [key, value] of Object.entries({ mode, testId, attempt })) {
    if (manifest.epoch[key] !== value) throw new Error(`EXISTING_IDENTITY_MISMATCH: ${key}`);
  }
  const socket = createConnection(manifest.socketPath);
  const pending = new Map();
  let nextId = 0;
  let failure;
  let intentionalClose = false;
  let directory;
  const fatal = (error) => {
    failure ??= error;
    mkdirSync(output, { recursive: true });
    writeFileSync(resolve(output, 'fatal-cleanup.txt'), `${failure.message}\n`);
  };
  const failPending = (error) => {
    if (!intentionalClose) fatal(error);
    for (const request of pending.values()) request.reject(error);
    pending.clear();
  };
  socket.on('error', failPending);
  socket.once('close', () => failPending(new Error('EXISTING_CONTROLLER_DISCONNECTED')));
  const lines = createInterface({ input: socket });
  lines.on('error', failPending);
  lines.on('line', (line) => {
    try {
      const reply = JSON.parse(line);
      const request = pending.get(reply.id);
      if (!request) throw new Error('EXISTING_INVALID_REPLY');
      pending.delete(reply.id);
      if (reply.error) request.reject(new Error(reply.error));
      else if (reply.result?.epochId !== manifest.epoch.epochId) request.reject(new Error('EXISTING_INVALID_REPLY'));
      else request.resolve(reply.result);
    } catch (error) {
      failPending(error);
      socket.destroy();
    }
  });
  const request = (action, extra = {}) =>
    new Promise((done, fail) => {
      if (socket.destroyed || socket.writableEnded) {
        fail(failure ?? new Error('EXISTING_CONTROLLER_DISCONNECTED'));
        return;
      }
      const id = ++nextId;
      const timer = setTimeout(() => {
        failPending(new Error(`EXISTING_CONTROL_TIMEOUT: ${action}`));
        socket.destroy();
      }, 60000);
      const settle = (callback) => (result) => {
        clearTimeout(timer);
        callback(result);
      };
      pending.set(id, { resolve: settle(done), reject: settle(fail) });
      socket.write(`${JSON.stringify({ id, token: manifest.claimToken, action, ...extra })}\n`, (error) => {
        if (error) failPending(error);
      });
    });
  const save = (epoch) =>
    writeFileSync(
      resolve(directory, 'manifest.json'),
      JSON.stringify(
        {
          ...epoch,
          existingManifest: resolve(manifestPath),
          controllerPid: manifest.controllerPid,
        },
        null,
        2,
      ),
    );
  try {
    const epoch = await request('claim', {
      epochId: manifest.epoch.epochId,
      mode,
      testId,
      attempt,
    });
    directory = resolve(output, 'epochs', epoch.epochId);
    mkdirSync(directory, { recursive: true });
    save(epoch);
    let quiescing;
    let stopping;
    return {
      ...epoch,
      directory,
      assertHealthy: () => {
        if (failure) throw failure;
      },
      fatal: (error) => {
        fatal(error);
        void request('fatal').catch(fatal);
      },
      quiesce: () => {
        quiescing ??= request('quiesce').then(save);
        return quiescing;
      },
      stop: () => {
        stopping ??= (async () => {
          try {
            save(await request('stop'));
          } finally {
            intentionalClose = true;
            socket.destroy();
          }
        })();
        return stopping;
      },
    };
  } catch (error) {
    intentionalClose = true;
    socket.destroy();
    throw error;
  }
};

export { attachExistingEpoch };
