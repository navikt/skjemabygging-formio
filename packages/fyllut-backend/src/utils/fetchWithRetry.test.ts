import fetchWithRetry from "./fetchWithRetry";
import nock from "nock";
import { FetchError } from "node-fetch";

const TEST_HOST = "https://www.test.no";
const TEST_PATH = "/projects/123";
const TEST_URL = `${TEST_HOST}${TEST_PATH}`;

describe("fetchWithRetry", () => {
  const FETCH_ERROR = new FetchError(
    "Client network socket disconnected before secure TLS connection was established",
    "system",
  );

  it("Retries fetch up to three times and succeeds", async () => {
    nock(TEST_HOST).get(TEST_PATH).twice().replyWithError(FETCH_ERROR).get(TEST_PATH).once().reply(200);
    let response;
    let errorCaught: any = undefined;
    try {
      response = await fetchWithRetry(TEST_URL, {
        method: "GET",
        retry: 3,
        retryDelay: 5,
      });
    } catch (e: any) {
      errorCaught = e;
    }
    expect(errorCaught).toBeUndefined();
    expect(response).toBeDefined();
    expect(response.ok).toBe(true);
  });

  it("Retries fetch up to three times and fails", async () => {
    nock(TEST_HOST).get(TEST_PATH).thrice().replyWithError(FETCH_ERROR);
    let response;
    let errorCaught: any = undefined;
    try {
      response = await fetchWithRetry(TEST_URL, {
        method: "GET",
        retry: 3,
        retryDelay: 5,
      });
    } catch (e: any) {
      errorCaught = e;
    }
    expect(response).toBeUndefined();
    expect(errorCaught).toBeDefined();
    expect(errorCaught?.message).toContain(FETCH_ERROR.message);
  });

  it("Returns 500 response without retrying", async () => {
    nock(TEST_HOST).get(TEST_PATH).thrice().reply(500);
    let response;
    let errorCaught: any = undefined;
    try {
      response = await fetchWithRetry(TEST_URL, {
        method: "GET",
        retry: 3,
        retryDelay: 5,
      });
    } catch (e: any) {
      errorCaught = e;
    }
    expect(response).toBeDefined();
    expect(response.ok).toBe(false);
    expect(errorCaught).toBeUndefined();
  });

  it("Returns 200 response without retrying", async () => {
    nock(TEST_HOST).get(TEST_PATH).thrice().reply(200);
    let response;
    let errorCaught: any = undefined;
    try {
      response = await fetchWithRetry(TEST_URL, {
        method: "GET",
        retry: 3,
        retryDelay: 5,
      });
    } catch (e: any) {
      errorCaught = e;
    }
    expect(response).toBeDefined();
    expect(response.ok).toBe(true);
    expect(errorCaught).toBeUndefined();
  });
});
