import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { Blob } from 'node:buffer';
import { URL as nodeUrl } from 'node:url';
import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

const fetchMock = createFetchMock(vi);

fetchMock.enableMocks();

globalThis.URL = nodeUrl as any;
globalThis.Blob = Blob as any;

afterEach(() => {
  cleanup();
});

afterAll(() => {
  vi.restoreAllMocks();
});
