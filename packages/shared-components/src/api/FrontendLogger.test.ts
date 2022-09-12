import nock from "nock";
import FrontendLogger from "./FrontendLogger";
import http from "./http";

const BASE_PATH = "http://test.nav.no";
const PATH_API_LOG_ERROR = "/api/log/error";
const PATH_API_LOG_INFO = "/api/log/info";

describe("FrontendLogger", () => {
  const createLogger = (enabled = true) => new FrontendLogger(http, BASE_PATH, enabled);

  it("Invokes error endpoint in backend", async () => {
    nock(BASE_PATH).post(PATH_API_LOG_ERROR).reply(200);
    const logger = createLogger();
    await logger._error("En feil oppstod", { skjemanummer: "NAV 12.34-56" });
    expect(nock.isDone()).toBe(true);
  });

  it("Invokes info endpoint in backend", async () => {
    nock(BASE_PATH).post(PATH_API_LOG_INFO).reply(200);
    const logger = createLogger();
    await logger._info("Bruker klikket publiser", { skjemanummer: "NAV 12.34-56" });
    expect(nock.isDone()).toBe(true);
  });

  it("Ignores backend failure", async () => {
    nock(BASE_PATH).post(PATH_API_LOG_ERROR).reply(500);
    const logger = createLogger();
    await logger._error("En feil oppstod", { skjemanummer: "NAV 12.34-56" });
    expect(nock.isDone()).toBe(true);
  });

  it("Disabled logger does not invoke backend", async () => {
    nock(BASE_PATH).post(PATH_API_LOG_ERROR).times(0);
    const logger = createLogger(false);
    await logger._error("En feil oppstod");
    expect(nock.isDone()).toBe(true);
  });
});
