import { spawn, type ChildProcess } from 'node:child_process';
import { closeSync, existsSync, openSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { createFyllutServerConfig } from '../../../../bin/fyllut-server-config.mjs';

const root = resolve(import.meta.dirname, '../../../..');

const freePorts = async (count: number) => {
  const ports: number[] = [];
  const candidates = Array.from({ length: 60 }, (_, index) => 3440 + index);
  while (candidates.length && ports.length < count) {
    const port = candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0];
    const available = await new Promise<boolean>((done, fail) => {
      const server = createServer();
      server.once('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') done(false);
        else fail(error);
      });
      server.listen(port, '127.0.0.1', () => server.close((error) => (error ? fail(error) : done(true))));
    });
    if (available) ports.push(port);
  }
  if (ports.length !== count) throw new Error(`Need ${count} free ports in 3440-3499`);
  return ports;
};

const stopProcess = async (child: ChildProcess) => {
  const pid = child.pid;
  if (!pid) return;
  if (process.platform === 'win32') {
    if (child.exitCode !== null || child.signalCode !== null) return;
    const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f']);
    await new Promise<void>((done, fail) => {
      killer.once('error', fail);
      killer.once('exit', (code) => (code === 0 ? done() : fail(new Error(`taskkill exited ${code}`))));
    });
    return;
  }
  const signalGroup = (signal: NodeJS.Signals | 0) => {
    try {
      process.kill(-pid, signal);
      return true;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ESRCH') return false;
      throw error;
    }
  };
  const alive = () => signalGroup(0);
  if (!alive()) return;
  // Match stopping a local dev server with Ctrl+C, not the backend's Nais SIGTERM delay.
  signalGroup('SIGINT');
  const deadline = Date.now() + 5000;
  while (alive() && Date.now() < deadline) await delay(25);
  if (alive()) {
    signalGroup('SIGKILL');
    const forcedDeadline = Date.now() + 5000;
    while (alive() && Date.now() < forcedDeadline) await delay(25);
    throw new Error(`Server ${child.pid} did not stop on SIGINT; forced cleanup, still alive: ${alive()}`);
  }
};

const launchServers = async (directory: string, mode: 'dev' | 'built', attempt: number, deadline: number) => {
  const built = mode === 'built';
  if (built) {
    for (const path of ['packages/fyllut/dist/index.html', 'packages/fyllut-backend/dist/server.mjs']) {
      if (!existsSync(resolve(root, path))) throw new Error(`Missing ${path}. Run pnpm build:fyllut first.`);
    }
  }
  const validationLog = resolve(directory, 'body-verification.jsonl');
  const logPath = resolve(directory, `servers-${attempt}.log`);
  const listenLog = resolve(directory, `listeners-${attempt}.log`);
  const readinessModule = resolve(import.meta.dirname, 'server-readiness.mjs');
  const ports = await freePorts(built ? 3 : 4);
  const plan = createFyllutServerConfig({ repoRoot: root, ports, mode: built ? 'built' : 'dev', validationLog });
  const children: { child: ChildProcess; stopping: boolean }[] = [];
  const failures: Error[] = [];
  let stopped: Promise<void> | undefined;
  const assertHealthy = () => {
    // The mocks admin API logs bind errors without necessarily exiting its process.
    const log = existsSync(logPath) ? readFileSync(logPath, 'utf8') : '';
    if (/EADDRINUSE|Port \d+ is already in use/.test(log)) {
      throw Object.assign(new Error(`Test server port collision. See ${logPath}`), { code: 'EADDRINUSE' });
    }
    if (failures.length) throw new AggregateError(failures, `Test server failed. See ${logPath}`);
  };
  const stop = () => {
    stopped ??= (async () => {
      const errors: unknown[] = [];
      // Stop app processes before mocks so late backend calls cannot enter another test.
      for (const entry of [...children].reverse()) {
        entry.stopping = true;
        try {
          await stopProcess(entry.child);
        } catch (error) {
          errors.push(error);
        }
      }
      if (errors.length) throw new AggregateError(errors, `Server cleanup failed. See ${logPath}`);
    })();
    return stopped;
  };
  try {
    const logFile = openSync(logPath, 'a');
    try {
      for (const [command, args, env, cwd] of plan.commands) {
        const child = spawn(command, args, {
          cwd,
          env: {
            ...process.env,
            ...env,
            FYLLUT_PLAYWRIGHT_LISTEN_LOG: listenLog,
            NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --require="${readinessModule}"`,
          },
          detached: process.platform !== 'win32',
          stdio: ['ignore', logFile, logFile],
        });
        const entry = { child, stopping: false };
        children.push(entry);
        child.once('error', (error) => failures.push(error));
        child.once('exit', (code, signal) => {
          if (!entry.stopping) failures.push(new Error(`Server ${cwd} exited: ${code ?? signal}`));
        });
      }
    } finally {
      closeSync(logFile);
    }
    const pending = new Set(plan.healthURLs);
    // The first process serves both mock ports; subsequent processes each serve one app port.
    const ownedListeners = ports.map((port, index) => `${children[Math.max(0, index - 1)].child.pid}:${port}`);
    while (pending.size) {
      assertHealthy();
      if (Date.now() > deadline) throw new Error(`Servers not ready: ${[...pending].join(', ')}. See ${logPath}`);
      await Promise.all(
        [...pending].map(async (url) => {
          try {
            const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(1000) });
            await response.body?.cancel();
            if (response.ok) pending.delete(url);
          } catch (error) {
            if (!(error instanceof TypeError) && !(error instanceof Error && error.name === 'TimeoutError'))
              throw error;
          }
        }),
      );
      const listeners = existsSync(listenLog) ? new Set(readFileSync(listenLog, 'utf8').trim().split('\n')) : new Set();
      for (const url of plan.healthURLs) {
        const portIndex = ports.indexOf(Number(new URL(url).port));
        if (!listeners.has(ownedListeners[portIndex])) pending.add(url);
      }
      if (pending.size) await delay(100);
    }
    assertHealthy();
    return { ...plan, ports, validationLog, logPath, assertHealthy, stop };
  } catch (error) {
    try {
      await stop();
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'Server startup and cleanup failed', { cause: cleanupError });
    }
    throw error;
  }
};

const startServers = async (
  directory: string,
  mode: 'dev' | 'built' = process.env.FYLLUT_PLAYWRIGHT_MODE === 'built' ? 'built' : 'dev',
) => {
  const deadline = Date.now() + 60000;
  for (let attempt = 1; ; attempt++) {
    try {
      return await launchServers(directory, mode, attempt, deadline);
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'EADDRINUSE') || attempt === 3) throw error;
      console.warn(`Retrying server startup after a port collision: ${error.message}`);
    }
  }
};

export { startServers, stopProcess };
