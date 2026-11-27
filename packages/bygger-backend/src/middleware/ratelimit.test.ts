import express from 'express';
import { AddressInfo } from 'net';

const PRODUCTION_LIMIT = 60;

const mockConfig = vi.hoisted(() => ({ isDevelopment: false }));
vi.mock('../config', () => ({ default: mockConfig }));

const countRateLimitedPageLoads = async (isDevelopment: boolean, requests: number) => {
  mockConfig.isDevelopment = isDevelopment;
  vi.resetModules();
  const { fsAccessRateLimiter } = await import('./ratelimit');

  const app = express();
  app.get('/*path', fsAccessRateLimiter, (_req, res) => {
    res.send('ok');
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;

  try {
    const statuses: number[] = [];
    for (let i = 0; i < requests; i++) {
      const response = await fetch(`http://127.0.0.1:${port}/forms/test/settings`);
      statuses.push(response.status);
    }
    return statuses.filter((status) => status === 429).length;
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

describe('fsAccessRateLimiter', () => {
  it('rejects page loads above the production limit', async () => {
    expect(await countRateLimitedPageLoads(false, PRODUCTION_LIMIT + 1)).toBe(1);
  });

  it('allows more page loads in development', async () => {
    expect(await countRateLimitedPageLoads(true, PRODUCTION_LIMIT + 1)).toBe(0);
  });
});
