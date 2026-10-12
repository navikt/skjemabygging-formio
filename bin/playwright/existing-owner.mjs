import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { defaultPortRange } from '../lib/test-ports.mjs';
import { fingerprint, repoRoot, saveExistingManifest, withinRoot } from './existing-manifest.mjs';
import { startTestEpoch } from './test-epoch.mjs';

const prepareExistingEpoch = async (
  { manifestPath, output, mode, testId, ports, portRange, signal },
  { startEpoch = startTestEpoch, ttlMs = 600000, onError = console.error } = {},
) => {
  const path = withinRoot(manifestPath);
  withinRoot(output);
  if (existsSync(path)) throw new Error('EXISTING_MANIFEST_ALREADY_EXISTS');
  if (!/^F\d{3}-T\d{3}$/.test(testId)) throw new Error('EXISTING_INVALID_TEST_ID');
  const socketId = randomBytes(8).toString('hex');
  const socketPath =
    process.platform === 'win32'
      ? `\\\\.\\pipe\\fyllut-playwright-${socketId}`
      : resolve(repoRoot, '.runtime', `pw-${socketId}.sock`);
  if (process.platform !== 'win32' && Buffer.byteLength(socketPath) > 100)
    throw new Error('EXISTING_SOCKET_PATH_TOO_LONG');
  mkdirSync(resolve(repoRoot, '.runtime'), { recursive: true });
  const sourceFingerprint = fingerprint(mode);
  const epoch = await startEpoch({
    mode,
    testId,
    attempt: 0,
    output,
    ports,
    portRange: portRange ?? (ports ? undefined : defaultPortRange),
    signal,
  });
  const readEpoch = () => JSON.parse(readFileSync(resolve(epoch.directory, 'manifest.json'), 'utf8'));
  const manifest = {
    protocol: 1,
    repoRoot,
    controllerPid: process.pid,
    socketPath,
    claimToken: randomBytes(32).toString('hex'),
    state: 'ready',
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    fingerprint: sourceFingerprint,
  };
  const server = createServer();
  const sockets = new Set();
  let claimant;
  let closing;
  let timer;
  let failure;
  const save = () => saveExistingManifest(path, manifest);
  const close = (error) => {
    if (error) {
      failure ??= error;
      epoch.fatal(error);
    }
    closing ??= (async () => {
      clearTimeout(timer);
      try {
        await epoch.stop();
        manifest.epoch = readEpoch();
        if (failure) manifest.state = 'failed';
        else if (manifest.state === 'ready' || manifest.state === 'claimed') manifest.state = 'closed';
        save();
      } finally {
        for (const socket of sockets) socket.destroy();
        if (server.listening)
          await new Promise((done, fail) => server.close((closeError) => (closeError ? fail(closeError) : done())));
      }
    })();
    return closing;
  };
  const disconnected = () => {
    if (!closing && !manifest.epoch.stoppedAt) {
      const error = new Error('EXISTING_CLAIMANT_DISCONNECTED');
      onError(error);
      void close(error).catch(onError);
    }
  };
  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.on('error', onError);
    socket.once('close', () => {
      sockets.delete(socket);
      if (socket === claimant) disconnected();
    });
    const lines = createInterface({ input: socket });
    void (async () => {
      for await (const line of lines) {
        let request;
        try {
          if (line.length > 4096) throw new Error('EXISTING_INVALID_REQUEST');
          request = JSON.parse(line);
          if (!Number.isInteger(request.id) || request.token !== manifest.claimToken)
            throw new Error('EXISTING_AUTH_FAILED');
          if (closing) throw new Error('EXISTING_CLOSING');
          if (request.action === 'claim') {
            if (manifest.state !== 'ready' || claimant) throw new Error('EXISTING_BUSY');
            for (const key of ['epochId', 'mode', 'testId', 'attempt']) {
              if (request[key] !== manifest.epoch[key]) throw new Error(`EXISTING_IDENTITY_MISMATCH: ${key}`);
            }
            if (manifest.fingerprint !== fingerprint(mode)) throw new Error('EXISTING_SOURCE_CHANGED');
            epoch.assertHealthy();
            claimant = socket;
            manifest.state = 'claimed';
            clearTimeout(timer);
            save();
          } else {
            if (socket !== claimant) throw new Error('EXISTING_NOT_CLAIMED');
            if (request.action === 'quiesce') await epoch.quiesce();
            else if (request.action === 'stop') {
              if (!readEpoch().quiescedAt) throw new Error('EXISTING_QUIESCE_REQUIRED');
              await epoch.stop();
              manifest.state = failure ? 'failed' : 'consumed';
            } else if (request.action === 'fatal') {
              failure ??= new Error('EXISTING_TEST_FAILED');
              epoch.fatal(failure);
            } else throw new Error('EXISTING_INVALID_ACTION');
            manifest.epoch = readEpoch();
            save();
          }
          socket.write(`${JSON.stringify({ id: request.id, result: manifest.epoch })}\n`);
        } catch (error) {
          socket.write(`${JSON.stringify({ id: request?.id, error: error.message })}\n`);
        }
      }
    })().catch((error) => {
      onError(error);
      socket.destroy();
    });
  });
  try {
    manifest.epoch = readEpoch();
    signal?.throwIfAborted();
    await new Promise((done, fail) => {
      server.once('error', fail);
      server.listen(socketPath, () => {
        server.off('error', fail);
        done();
      });
    });
    server.on('error', (error) => {
      onError(error);
      void close(error).catch(onError);
    });
    signal?.throwIfAborted();
    save();
    timer = setTimeout(() => {
      manifest.state = 'expired';
      onError(new Error('EXISTING_EXPIRED'));
      void close().catch(onError);
    }, ttlMs);
    return { manifestPath: path, manifest, close };
  } catch (error) {
    try {
      await close(error);
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'EXISTING_START_AND_CLEANUP_FAILED', { cause: cleanupError });
    }
    throw error;
  }
};

export { prepareExistingEpoch };
