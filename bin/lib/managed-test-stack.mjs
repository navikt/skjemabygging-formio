import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const isPortFree = (port) =>
  new Promise((done, fail) => {
    const server = createServer();
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') done(false);
      else fail(new Error(`STACK_PORT_CHECK_FAILED: ${port}: ${error.code}`, { cause: error }));
    });
    server.listen(port, '127.0.0.1', () =>
      server.close((error) => {
        if (error) fail(error);
        else done(true);
      }),
    );
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
  { commands, listeningPorts, healthUrls, serviceNames, onReady, onCleanup },
  {
    timeoutMs = 60000,
    log = (chunk) => process.stdout.write(chunk),
    signal,
    onFailure = () => {},
    onSpawn = () => {},
    onStartupDiagnostics = () => {},
  } = {},
) => {
  const started = performance.now();
  const elapsed = () => Math.round(performance.now() - started);
  const services = listeningPorts.map((ports, index) => ({
    name: serviceNames?.[index] ?? `service-${index + 1}`,
    ports,
    pid: null,
    spawnedMs: null,
    boundMs: null,
    exitCode: null,
    exitSignal: null,
  }));
  const probes = healthUrls.map((value) => {
    const url = new URL(value);
    url.username = '';
    url.password = '';
    url.search = '';
    url.hash = '';
    return { url: url.href, status: null, error: null, readyMs: null };
  });
  const diagnose = (state, reason = null) =>
    onStartupDiagnostics(structuredClone({ state, reason, elapsedMs: elapsed(), services, probes }));
  signal?.throwIfAborted();
  const ports = listeningPorts.flat();
  try {
    if (!(await Promise.all(ports.map(isPortFree))).every(Boolean)) {
      throw Object.assign(new Error(`STACK_PORT_COLLISION: ${ports.join(', ')}`), { code: 'EADDRINUSE' });
    }
  } catch (error) {
    diagnose('failed', 'port-check');
    throw error;
  }
  signal?.throwIfAborted();
  const reportRoot = resolve(import.meta.dirname, '../../.runtime');
  mkdirSync(reportRoot, { recursive: true });
  const reportDirectory = mkdtempSync(resolve(reportRoot, 'bind-'));
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
      rmSync(reportDirectory, { recursive: true });
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
          env: { ...process.env, ...env, MANAGED_STACK_BIND_REPORT_DIR: reportDirectory },
          detached: process.platform !== 'win32',
          stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        },
      );
      children.push(child);
      services[index].pid = child.pid ?? null;
      services[index].spawnedMs = elapsed();
      if (child.pid) onSpawn(child.pid);
      child.stdout.on('data', log);
      child.stderr.on('data', log);
      const bindFailure = (message) => {
        if (message?.type !== 'listen-error' || message.pid !== child.pid) return;
        fail(
          Object.assign(new Error(`STACK_LISTEN_FAILED: ${message.code}: ${message.port}`), {
            code: listeningPorts[index].includes(message.port) ? message.code : undefined,
          }),
        );
      };
      child.on('message', (message) => {
        if (message?.type === 'listening' && message.pid === child.pid) {
          if (listeningPorts[index].includes(message.port)) bound[index].add(message.port);
          if (listeningPorts[index].every((port) => bound[index].has(port))) services[index].boundMs = elapsed();
        } else if (message?.type === 'listen-error' && message.pid === child.pid) {
          bindFailure(message);
        }
      });
      child.once('error', (error) => {
        if (!childStops.has(child)) fail(error);
      });
      child.once('exit', (code, exitSignal) => {
        services[index].exitCode = code;
        services[index].exitSignal = exitSignal;
        if (!childStops.has(child)) {
          const report = resolve(reportDirectory, `${child.pid}.json`);
          if (existsSync(report)) bindFailure(JSON.parse(readFileSync(report, 'utf8')));
          fail(new Error(`STACK_CHILD_EXIT: ${child.pid}: ${code ?? exitSignal}`));
        }
      });
    }
    const deadline = Date.now() + timeoutMs;
    const healthy = new Set();
    while (Date.now() < deadline) {
      signal?.throwIfAborted();
      if (failure) throw failure;
      if (listeningPorts.every((expected, index) => expected.every((port) => bound[index].has(port)))) {
        await Promise.all(
          healthUrls.map(async (url, index) => {
            if (healthy.has(url)) return;
            try {
              const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(1000) });
              await response.body?.cancel();
              probes[index].status = response.status;
              probes[index].error = null;
              if (response.ok) {
                healthy.add(url);
                probes[index].readyMs = elapsed();
              }
            } catch (error) {
              if (!(error instanceof TypeError) && error.name !== 'TimeoutError') throw error;
              probes[index].status = null;
              probes[index].error = error.name === 'TimeoutError' ? 'timeout' : 'connection';
            }
          }),
        );
        signal?.throwIfAborted();
        if (failure) throw failure;
        if (healthy.size === new Set(healthUrls).size) {
          await onReady?.();
          signal?.throwIfAborted();
          if (failure) throw failure;
          diagnose('ready');
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
    const errors = [error];
    try {
      await stop();
    } catch (cleanupError) {
      errors.push(cleanupError);
    }
    try {
      const reason = signal?.aborted
        ? 'interrupted'
        : error.message.startsWith('STACK_STARTUP_TIMEOUT')
          ? 'readiness-timeout'
          : 'startup-error';
      diagnose('failed', reason);
    } catch (diagnosticError) {
      errors.push(diagnosticError);
    }
    if (errors.length > 1) throw new AggregateError(errors, 'Stack startup and cleanup failed', { cause: error });
    throw error;
  }
};

export { isPortFree, startManagedStack };
