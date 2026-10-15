import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer as createHttpServer } from 'node:http';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import * as serverConfig from '../../../../bin/fyllut-server-config.mjs';
import tc07 from '../../../../mocks/mocks/data/test-cases/tc07-pdf-body.json';
import { checkRequestBodies, useRouteVariant } from './mock-client';
import { startServers, stopProcess } from './servers';

const expectPortsReleased = async (ports: number[]) => {
  for (const port of ports) {
    const server = createServer();
    await new Promise<void>((done, fail) => {
      server.once('error', fail);
      server.listen(port, '127.0.0.1', () => server.close((error) => (error ? fail(error) : done())));
    });
  }
};

describe('FyllUt Playwright server support', () => {
  it('isolates concurrent stacks and stopping one leaves the other available', async () => {
    const firstDir = mkdtempSync(join(tmpdir(), 'fyllut-first-'));
    const secondDir = mkdtempSync(join(tmpdir(), 'fyllut-second-'));
    const stacks: Awaited<ReturnType<typeof startServers>>[] = [];
    try {
      const starts = await Promise.allSettled(
        [firstDir, secondDir].map(async (directory) => {
          stacks.push(await startServers(directory, 'built'));
        }),
      );
      for (const result of starts) {
        if (result.status === 'rejected') throw result.reason;
      }
      const [first, second] = stacks;
      expect(first.ports.some((port) => second.ports.includes(port))).toBe(false);
      await useRouteVariant(first.adminURL, 'post-familie-pdf:success-tc07');
      const variants = await (await fetch(`${second.adminURL}/api/mock/custom-route-variants`)).json();
      expect(variants).toEqual([]);
      await first.stop();
      await expectPortsReleased(first.ports);
      expect((await fetch(`${second.backendURL}/fyllut/internal/isready`)).status).toBe(200);
      second.assertHealthy();
    } finally {
      const stops = await Promise.allSettled(
        stacks.map(async (servers) => {
          await servers.stop();
          await expectPortsReleased(servers.ports);
        }),
      );
      rmSync(firstDir, { recursive: true });
      rmSync(secondDir, { recursive: true });
      expect(stops.filter((result) => result.status === 'rejected')).toEqual([]);
    }
  }, 90000);

  it('does not accept a health response from another process during startup', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'fyllut-collision-'));
    const impostor = createHttpServer((_, response) => response.end('another process'));
    const original = serverConfig.createFyllutServerConfig;
    let occupiedPort: number | undefined;
    const config = vi.spyOn(serverConfig, 'createFyllutServerConfig').mockImplementation((options) => {
      const plan = original(options);
      if (occupiedPort === undefined) {
        occupiedPort = options.ports[2];
        impostor.listen(occupiedPort, '127.0.0.1');
        const [command, args, env, cwd] = plan.commands[1];
        plan.commands[1] = [
          command,
          [
            '--input-type=module',
            '--eval',
            `setTimeout(() => import(${JSON.stringify(pathToFileURL(args[0]).href)}), 4000)`,
          ],
          env,
          cwd,
        ];
      }
      return plan;
    });
    let servers: Awaited<ReturnType<typeof startServers>> | undefined;
    try {
      servers = await startServers(directory, 'built');
      expect(servers.ports).not.toContain(occupiedPort);
      expect((await fetch(`${servers.backendURL}/fyllut/internal/isready`)).status).toBe(200);
      servers.assertHealthy();
      await servers.stop();
      await expectPortsReleased(servers.ports);
      expect(impostor.listening).toBe(true);
      const response = await fetch(`http://127.0.0.1:${occupiedPort}/fyllut/internal/isready`);
      expect(await response.text()).toBe('another process');
    } finally {
      config.mockRestore();
      await servers?.stop();
      await new Promise<void>((done, fail) => impostor.close((error) => (error ? fail(error) : done())));
      rmSync(directory, { recursive: true });
    }
  }, 90000);

  it('rejects unknown variants, missing validation, wrong variants and body mismatch with real mocks', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'fyllut-validation-'));
    const servers = await startServers(directory, 'built');
    const id = 'post-familie-pdf:success-tc07';
    try {
      await expect(useRouteVariant(servers.adminURL, 'post-familie-pdf:does-not-exist')).rejects.toThrow();
      expect(() => checkRequestBodies(servers.validationLog, [id])).toThrow('was not validated');
      const send = (body: unknown) =>
        fetch(`${servers.mockURL}/api/pdf/v3/opprett-pdf`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        });
      const wrongVariant = await send(tc07);
      await wrongVariant.body?.cancel();
      expect(wrongVariant.status).toBe(200);
      expect(() => checkRequestBodies(servers.validationLog, [id])).toThrow('was not validated');
      await useRouteVariant(servers.adminURL, id);
      const valid = await send(tc07);
      await valid.body?.cancel();
      expect(valid.status).toBe(200);
      checkRequestBodies(servers.validationLog, [id]);
      const invalid = await send({ ...tc07, bunntekst: { ...tc07.bunntekst, lowerMiddle: 'wrong' } });
      await invalid.body?.cancel();
      expect(invalid.status).toBe(400);
      expect(() => checkRequestBodies(servers.validationLog, [id])).toThrow('bunntekst.lowerMiddle');
    } finally {
      await servers.stop();
      await expectPortsReleased(servers.ports);
      rmSync(directory, { recursive: true });
    }
  }, 90000);

  it('stops an owned process with SIGINT', async () => {
    const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000); process.send("ready")'], {
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
    });
    try {
      await new Promise<void>((done, fail) => {
        child.once('message', () => done());
        child.once('error', fail);
      });
    } finally {
      await stopProcess(child);
    }
    expect(child.exitCode !== null || child.signalCode !== null).toBe(true);
  });
});
