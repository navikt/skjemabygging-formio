#!/usr/bin/env node
/**
 * Starts fyllut or bygger on automatically allocated free ports.
 * Designed for sub-agents and CI environments where default ports may be occupied.
 *
 * Usage:
 *   node bin/start.mjs fyllut
 *   node bin/start.mjs bygger
 *
 *   yarn start:fyllut:auto
 *   yarn start:bygger:auto
 *
 * Output (printed before servers start, easy to parse):
 *   FYLLUT_MOCK_PORT=3000
 *   FYLLUT_BACKEND_PORT=3001
 *   FYLLUT_FRONTEND_PORT=3002
 *   FYLLUT_FRONTEND_URL=http://localhost:3002
 */

import { spawn } from 'child_process';
import { connect, createServer } from 'net';

const isPortFree = (port) =>
  new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, '127.0.0.1');
  });

const waitForPort = (port, timeout = 60000) =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const attempt = () => {
      const socket = connect(port, '127.0.0.1');
      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - start > timeout) return reject(new Error(`Port ${port} not ready after ${timeout}ms`));
        setTimeout(attempt, 250);
      });
    };
    attempt();
  });

const getFreePorts = async (count, start = 3440) => {
  const ports = [];
  let port = start;
  while (ports.length < count) {
    if (await isPortFree(port)) ports.push(port);
    port++;
  }
  return ports;
};

const target = process.argv[2];

const configs = {
  fyllut: async () => {
    const [mockPort, backendPort, frontendPort] = await getFreePorts(3);
    console.log(`FYLLUT_MOCK_PORT=${mockPort}`);
    console.log(`FYLLUT_BACKEND_PORT=${backendPort}`);
    console.log(`FYLLUT_FRONTEND_PORT=${frontendPort}`);
    console.log(`FYLLUT_FRONTEND_URL=http://localhost:${frontendPort}`);
    console.log('');
    return {
      commands: [
        ['yarn', ['mocks:fyllut:no-cli', '--', `--server.port=${mockPort}`]],
        ['yarn', ['workspace', '@navikt/fyllut-backend', 'start', '--', '--port', String(backendPort)]],
        ['yarn', ['workspace', '@navikt/fyllut-frontend', 'start', '--', '--port', String(frontendPort), `--backend-port=${backendPort}`]],
      ],
      ports: [mockPort, backendPort, frontendPort],
    };
  },
  bygger: async () => {
    const [backendPort, frontendPort] = await getFreePorts(2);
    console.log(`BYGGER_BACKEND_PORT=${backendPort}`);
    console.log(`BYGGER_FRONTEND_PORT=${frontendPort}`);
    console.log(`BYGGER_FRONTEND_URL=http://localhost:${frontendPort}`);
    console.log('');
    return {
      commands: [
        ['yarn', ['workspace', '@navikt/bygger-backend', 'start', '--', '--port', String(backendPort)]],
        ['yarn', ['workspace', '@navikt/bygger-frontend', 'start', '--', '--port', String(frontendPort), `--backend-port=${backendPort}`]],
      ],
      ports: [backendPort, frontendPort],
    };
  },
};

if (!configs[target]) {
  console.error(`Usage: node bin/start.mjs <fyllut|bygger>`);
  process.exit(1);
}

const { commands, ports } = await configs[target]();

// Use detached:true so each child gets its own process group.
// Killing by -pid sends SIGTERM to the entire group (shell + yarn + vite),
// preventing orphaned processes when shell: true is used.
const opts = { stdio: 'inherit', shell: true, detached: true };
const procs = commands.map(([cmd, args]) => spawn(cmd, args, opts));
// Unref so this script doesn't keep the event loop alive on its own
procs.forEach((p) => p.unref());

const killAll = (signal) => {
  procs.forEach((p) => {
    try { process.kill(-p.pid, signal); } catch { /* already gone */ }
  });
};

process.on('SIGINT', () => killAll('SIGINT'));
process.on('SIGTERM', () => killAll('SIGTERM'));

// Print our own PID so agents can also stop everything with: kill <START_PID>
console.log(`START_PID=${process.pid}`);

// Wait for all ports to accept connections, then signal readiness
Promise.all(ports.map((p) => waitForPort(p))).then(() => {
  console.log('READY=true');
});

let exitCode = 0;
let exited = 0;
procs.forEach((p) => {
  p.on('exit', (code) => {
    exitCode = exitCode || code || 0;
    if (++exited === procs.length) process.exit(exitCode);
  });
});
