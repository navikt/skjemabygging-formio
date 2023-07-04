import "@testing-library/jest-dom";
import { vi } from "vitest";
import createFetchMock from "vitest-fetch-mock";
import waitForExpect from "wait-for-expect";

const fetchMock = createFetchMock(vi);

fetchMock.enableMocks();

waitForExpect.defaults.timeout = 250;
