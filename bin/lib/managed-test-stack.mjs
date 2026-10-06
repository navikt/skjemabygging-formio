import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const isPortFree = (port) =>
  new Promise((done) => {
    const server = createServer();
    server.once('error', () => done(false));
    server.listen(port, '127.0.0.1', () => server.close(() => done(true)));
  });

const stopChild = async (child, graceMs = 3000) => {
  if (!child.pid) return;
  if (process.platform === 'win32') {
    const code = await new Promise((done, fail) => {
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
      killer.once('error', fail);
      killer.once('exit', done);
    });
    const deadline = Date.now() + 5000;
    while (child.exitCode === null && child.signalCode === null && Date.now() < deadline) await delay(50);
    if (code !== 0 || (child.exitCode === null && child.signalCode === null)) {
      throw new Error(`STACK_CLEANUP_FAILED: taskkill ${child.pid} returned ${code} without confirmed exit`);
    }
    return;
  }
  const groupAlive = () => {
    try {
      process.kill(process.platform === 'win32' ? child.pid : -child.pid, 0);
      return true;
    } catch (error) {
      if (error.code === 'ESRCH') return false;
      throw error;
    }
  };
  const signal = (value) => {
    try {
      process.kill(process.platform === 'win32' ? child.pid : -child.pid, value);
    } catch (error) {
      if (error.code !== 'ESRCH') throw error;
    }
  };
  signal('SIGTERM');
  const until = Date.now() + graceMs;
  while (groupAlive() && Date.now() < until) await delay(50);
  if (groupAlive()) signal('SIGKILL');
  const deadline = Date.now() + 5000;
  while (groupAlive() && Date.now() < deadline) await delay(50);
  if (groupAlive()) throw new Error(`STACK_CLEANUP_FAILED: process group ${child.pid} is still alive`);
  if (child.exitCode === null && child.signalCode === null) {
    throw new Error(`STACK_CLEANUP_FAILED: exit not observed for ${child.pid}`);
  }
};

const startManagedStack = async (
  { commands, listeningPorts, healthUrls, onReady, onCleanup },
  {
    timeoutMs = 60000,
    log = (chunk) => process.stdout.write(chunk),
    signal,
    onFailure = () => {},
    onSpawn = () => {},
  } = {},
) => {
  signal?.throwIfAborted();
  const ports = listeningPorts.flat();
  if (!(await Promise.all(ports.map(isPortFree))).every(Boolean)) {
    throw new Error(`STACK_PORT_COLLISION: ${ports.join(', ')}`);
  }
  signal?.throwIfAborted();
  const children = [];
  const childStops = new Map();
  const bound = listeningPorts.map(() => new Set());
  let failure;
  let ready = false;
  let stopping = false;
  let stopPromise;
  const stopOwnedChild = (child) => {
    if (!childStops.has(child)) childStops.set(child, stopChild(child));
    return childStops.get(child);
  };
  const stopChildren = async (pids) => {
    const selected = pids.map((pid) => {
      const child = children.find((candidate) => candidate.pid === pid);
      if (!child) throw new Error(`STACK_UNKNOWN_CHILD: ${pid}`);
      return child;
    });
    const results = await Promise.allSettled(selected.map(stopOwnedChild));
    const errors = results.filter((result) => result.status === 'rejected').map((result) => result.reason);
    if (errors.length) throw new AggregateError(errors, 'STACK_CLEANUP_FAILED');
  };
  const stop = () => {
    stopPromise ??= (async () => {
      stopping = true;
      const results = await Promise.allSettled(children.map(stopOwnedChild));
      const errors = results.filter((result) => result.status === 'rejected').map((result) => result.reason);
      try {
        await onCleanup?.();
      } catch (error) {
        errors.push(error);
      }
      if (errors.length) throw new AggregateError(errors, 'STACK_CLEANUP_FAILED');
    })();
    return stopPromise;
  };
  const fail = (error) => {
    if (stopping) return;
    failure ??= error;
    if (ready) onFailure(error);
  };
  try {
    for (const [index, [command, args, env, cwd]] of commands.entries()) {
      signal?.throwIfAborted();
      const child = spawn(
        command,
        ['--require', fileURLToPath(new URL('./report-listening.mjs', import.meta.url)), ...args],
        {
          cwd,
          env: { ...process.env, ...env },
          detached: process.platform !== 'win32',
          stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        },
      );
      children.push(child);
      if (child.pid) onSpawn(child.pid);
      child.stdout.on('data', log);
      child.stderr.on('data', log);
      child.on('message', (message) => {
        if (message?.type === 'listening' && message.pid === child.pid) {
          if (listeningPorts[index].includes(message.port)) bound[index].add(message.port);
        }
      });
      child.once('error', (error) => {
        if (!childStops.has(child)) fail(error);
      });
      child.once('exit', (code, exitSignal) => {
        if (!childStops.has(child)) fail(new Error(`STACK_CHILD_EXIT: ${child.pid}: ${code ?? exitSignal}`));
      });
    }
    const deadline = Date.now() + timeoutMs;
    const healthy = new Set();
    while (Date.now() < deadline) {
      signal?.throwIfAborted();
      if (failure) throw failure;
      if (listeningPorts.every((expected, index) => expected.every((port) => bound[index].has(port)))) {
        await Promise.all(
          healthUrls
            .filter((url) => !healthy.has(url))
            .map(async (url) => {
              try {
                const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(1000) });
                await response.body?.cancel();
                if (response.ok) healthy.add(url);
              } catch (error) {
                if (!(error instanceof TypeError) && error.name !== 'TimeoutError') throw error;
              }
            }),
        );
        signal?.throwIfAborted();
        if (failure) throw failure;
        if (healthy.size === new Set(healthUrls).size) {
          await onReady?.();
          signal?.throwIfAborted();
          if (failure) throw failure;
          ready = true;
          return {
            pids: children.map((child) => child.pid),
            stop,
            stopChildren,
            assertHealthy: () => {
              if (failure) throw failure;
            },
          };
        }
      }
      await delay(100);
    }
    throw new Error(`STACK_STARTUP_TIMEOUT: ${timeoutMs}ms; ports ${ports.join(', ')}`);
  } catch (error) {
    try {
      await stop();
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'Stack startup and cleanup failed', { cause: cleanupError });
    }
    throw error;
  }
};

export { isPortFree, startManagedStack };
