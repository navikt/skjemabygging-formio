import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

const fetchMock = createFetchMock(vi);

fetchMock.enableMocks();
fetchMock.dontMock();

// Setup tests should be allowed top level hooks
// eslint-disable-next-line mocha/no-top-level-hooks
afterEach(() => {
  cleanup();
});

// Setup tests should be allowed top level hooks
// eslint-disable-next-line mocha/no-top-level-hooks
afterAll(() => {
  vi.restoreAllMocks();
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

window.HTMLElement.prototype.scrollIntoView = vi.fn();
