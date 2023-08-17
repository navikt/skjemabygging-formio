import "@testing-library/jest-dom";
import { vi } from "vitest";
import createFetchMock from "vitest-fetch-mock";
import { URL } from "node:url";
import { Blob } from "node:buffer";

const fetchMock = createFetchMock(vi);

fetchMock.enableMocks();

// GlobalCsvLink.test.tsx contains test for createObjectURL to reproduce this error.
// @ts-ignore
globalThis.URL = URL;
// @ts-ignore
globalThis.Blob = Blob;
