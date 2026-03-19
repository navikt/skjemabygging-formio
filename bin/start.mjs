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
import { createServer } from 'net';

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

const getFreePorts = async (count, start = 3000) => {
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
    return [
      ['yarn', ['mocks:fyllut:no-cli', '--', `--server.port=${mockPort}`]],
      ['yarn', ['workspace', '@navikt/fyllut-backend', 'start', '--', '--port', String(backendPort)]],
      ['yarn', ['workspace', '@navikt/fyllut-frontend', 'start', '--', '--port', String(frontendPort), `--backend-port=${backendPort}`]],
    ];
  },
  bygger: async () => {
    const [backendPort, frontendPort] = await getFreePorts(2);
    console.log(`BYGGER_BACKEND_PORT=${backendPort}`);
    console.log(`BYGGER_FRONTEND_PORT=${frontendPort}`);
    console.log(`BYGGER_FRONTEND_URL=http://localhost:${frontendPort}`);
    console.log('');
    return [
      ['yarn', ['workspace', '@navikt/bygger-backend', 'start', '--', '--port', String(backendPort)]],
      ['yarn', ['workspace', '@navikt/bygger-frontend', 'start', '--', '--port', String(frontendPort), `--backend-port=${backendPort}`]],
    ];
  },
};

if (!configs[target]) {
  console.error(`Usage: node bin/start.mjs <fyllut|bygger>`);
  process.exit(1);
}

const commands = await configs[target]();
const opts = { stdio: 'inherit', shell: true };
const procs = commands.map(([cmd, args]) => spawn(cmd, args, opts));

process.on('SIGINT', () => procs.forEach((p) => p.kill('SIGINT')));
process.on('SIGTERM', () => procs.forEach((p) => p.kill('SIGTERM')));

let exitCode = 0;
let exited = 0;
procs.forEach((p) => {
  p.on('exit', (code) => {
    exitCode = exitCode || code || 0;
    if (++exited === procs.length) process.exit(exitCode);
  });
});
