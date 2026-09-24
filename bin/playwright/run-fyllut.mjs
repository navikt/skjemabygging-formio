#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const runId = `${Date.now()}-${process.pid}`;
const output = resolve(root, 'packages/fyllut/.runtime/playwright', runId);
const args = process.argv.slice(2).filter((arg) => arg !== '--');
const startupTimeout = 90000;
const maxStarts = 2;

mkdirSync(output, { recursive: true });

const stop = (child) =>
  new Promise((done) => {
    if (!child || child.exitCode !== null || child.signalCode !== null) return done();
    const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
    child.once('exit', () => {
      clearTimeout(timer);
      done();
    });
    child.kill('SIGTERM');
  });

const httpReady = async (url, timeout = 15000) => {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (response.ok) return;
    } catch {
      // The launcher can still be starting; the bounded loop below reports a failure.
    }
    await new Promise((done) => setTimeout(done, 250));
  }
  throw new Error(`HTTP readiness timed out: ${url}`);
};

const start = async () => {
  for (let attempt = 1; attempt <= maxStarts; attempt++) {
    const child = spawn(process.execPath, ['bin/start.mjs', 'fyllut', '--no-runtime-config'], {
      cwd: root,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const addresses = {};
    let buffer = '';
    try {
      const ready = await new Promise((done, fail) => {
        const timer = setTimeout(
          () => fail(new Error(`FyllUt startup timed out after ${startupTimeout}ms`)),
          startupTimeout,
        );
        const failed = (error) => {
          clearTimeout(timer);
          fail(error);
        };
        child.once('error', failed);
        child.once('exit', (code, signal) =>
          failed(new Error(`FyllUt launcher exited before readiness: ${code ?? signal}`)),
        );
        child.stdout.on('data', (chunk) => {
          process.stdout.write(chunk);
          buffer += chunk.toString();
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            const match = /^(FYLLUT_(?:MOCK_URL|MOCK_ADMIN_PORT|BACKEND_URL|FRONTEND_URL)|START_PID)=(.+)$/.exec(line);
            if (match) addresses[match[1]] = match[2];
            if (match?.[1] === 'START_PID') {
              clearTimeout(timer);
              done({ child, addresses });
            }
          }
        });
        child.stderr.on('data', (chunk) => process.stderr.write(chunk));
      });
      if (Number(ready.addresses.START_PID) !== child.pid) throw new Error('Launcher identity mismatch');
      const { FYLLUT_FRONTEND_URL, FYLLUT_BACKEND_URL, FYLLUT_MOCK_URL, FYLLUT_MOCK_ADMIN_PORT } = ready.addresses;
      if (!FYLLUT_FRONTEND_URL || !FYLLUT_BACKEND_URL || !FYLLUT_MOCK_URL || !FYLLUT_MOCK_ADMIN_PORT) {
        throw new Error('Incomplete FyllUt startup contract');
      }
      await Promise.all([
        httpReady(`${FYLLUT_BACKEND_URL}/fyllut/internal/isready`),
        httpReady(`${FYLLUT_FRONTEND_URL}/`),
        httpReady(`${FYLLUT_MOCK_URL}/forms-api/v1/global-translations`),
        httpReady(`http://127.0.0.1:${FYLLUT_MOCK_ADMIN_PORT}/api/about`),
      ]);
      if (child.exitCode !== null || child.signalCode !== null) throw new Error('Launcher stopped during readiness');
      return ready;
    } catch (error) {
      console.error(`FyllUt startup attempt ${attempt}/${maxStarts}: ${error.message}`);
      await stop(child);
      if (attempt === maxStarts) throw error;
    }
  }
  throw new Error('FyllUt startup attempts exhausted');
};

let launcher;
let runner;
let interrupted = false;
const interrupt = (signal) => {
  interrupted = true;
  runner?.kill(signal);
  if (!runner) void stop(launcher).then(() => process.exit(signal === 'SIGINT' ? 130 : 143));
};
process.on('SIGINT', () => interrupt('SIGINT'));
process.on('SIGTERM', () => interrupt('SIGTERM'));

try {
  const ready = await start();
  launcher = ready.child;
  const { FYLLUT_FRONTEND_URL, FYLLUT_MOCK_ADMIN_PORT } = ready.addresses;
  const baseURL = new URL(FYLLUT_FRONTEND_URL).origin;
  console.log(
    [
      `PLAYWRIGHT_RUN_ID=${runId}`,
      'PLAYWRIGHT_MODE=dev',
      `PLAYWRIGHT_BASE_URL=${baseURL}`,
      `PLAYWRIGHT_MOCK_ADMIN_URL=http://127.0.0.1:${FYLLUT_MOCK_ADMIN_PORT}`,
      `PLAYWRIGHT_OWNER_PID=${launcher.pid}`,
      `PLAYWRIGHT_ARTIFACTS=${output}`,
    ].join('\n'),
  );
  const exitCode = await new Promise((done, fail) => {
    runner = spawn(
      process.execPath,
      [
        resolve(root, 'packages/fyllut/node_modules/@playwright/test/cli.js'),
        'test',
        '--config',
        'packages/fyllut/playwright.config.ts',
        ...args,
      ],
      {
        cwd: root,
        stdio: 'inherit',
        env: {
          ...process.env,
          FYLLUT_PLAYWRIGHT_BASE_URL: baseURL,
          FYLLUT_PLAYWRIGHT_MOCK_ADMIN_URL: `http://127.0.0.1:${FYLLUT_MOCK_ADMIN_PORT}`,
          FYLLUT_PLAYWRIGHT_OUTPUT_DIR: output,
        },
      },
    );
    runner.once('error', fail);
    runner.once('exit', (code, signal) => done(code ?? (signal ? 1 : 0)));
  });
  await stop(launcher);
  if (interrupted) process.exit(process.exitCode || 130);
  process.exitCode = exitCode;
} catch (error) {
  console.error(error);
  await stop(runner);
  await stop(launcher);
  process.exitCode = 1;
}
