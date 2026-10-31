import dotenv from 'dotenv';

dotenv.config({ path: './src/test/test.env' });

const realFetch = globalThis.fetch;

// Fail tests that reach external services without mocking fetch, while allowing local test servers.
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : input);
  if (['127.0.0.1', 'localhost'].includes(url.hostname)) return realFetch(input, init);
  throw new Error(`Unmocked fetch: ${init?.method ?? 'GET'} ${url.href}`);
};
