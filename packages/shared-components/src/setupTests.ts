import "@testing-library/jest-dom";
import { vi } from "vitest";
import createFetchMock from "vitest-fetch-mock";

const fetchMock = createFetchMock(vi);

fetchMock.enableMocks();
fetchMock.dontMock();

Object.defineProperty(window, "matchMedia", {
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
