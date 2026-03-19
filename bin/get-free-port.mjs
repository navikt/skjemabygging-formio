#!/usr/bin/env node
/**
 * Finds N free TCP ports and prints them space-separated.
 *
 * Usage:
 *   node bin/get-free-port.mjs <count> [startPort]
 *
 * Examples:
 *   node bin/get-free-port.mjs 1          # one free port starting from 3000
 *   node bin/get-free-port.mjs 5 4000     # five free ports starting from 4000
 *
 * Typical agent usage:
 *   read MOCK BE_FYLLUT FE_FYLLUT BE_BYGGER FE_BYGGER <<<$(node bin/get-free-port.mjs 5)
 */

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

const getFreePorts = async (count, start) => {
  const ports = [];
  let port = start;
  while (ports.length < count) {
    if (await isPortFree(port)) ports.push(port);
    port++;
  }
  return ports;
};

const count = parseInt(process.argv[2] ?? '1');
const start = parseInt(process.argv[3] ?? '3000');

if (isNaN(count) || count < 1) {
  console.error('Usage: node bin/get-free-port.mjs <count> [startPort]');
  process.exit(1);
}

const ports = await getFreePorts(count, start);
process.stdout.write(ports.join(' ') + '\n');
