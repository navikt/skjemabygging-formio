import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

const fetchMock = createFetchMock(vi);

fetchMock.enableMocks();
fetchMock.dontMock();

afterEach(() => {
  cleanup();
});

afterAll(() => {
  vi.restoreAllMocks();
});
