import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { Blob } from 'node:buffer';
import { URL } from 'node:url';
import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

const fetchMock = createFetchMock(vi);

fetchMock.enableMocks();

// GlobalCsvLink.test.tsx contains test for createObjectURL to reproduce this error.
// @ts-ignore
globalThis.URL = URL;
// @ts-ignore
globalThis.Blob = Blob;

afterEach(() => {
  cleanup();
});

afterAll(() => {
  vi.restoreAllMocks();
});
