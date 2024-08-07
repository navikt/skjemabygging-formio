import nock from 'nock';
import { afterAll, beforeAll } from 'vitest';
import http from '../util/http/http';
import FrontendLogger, { LoggerConfig } from './FrontendLogger';

const BASE_PATH = 'http://test.nav.no';
const PATH_API_LOG_ERROR = '/api/log/error';
const PATH_API_LOG_INFO = '/api/log/info';

describe('FrontendLogger', () => {
  const createLogger = (config: LoggerConfig = { enabled: true }) => new FrontendLogger(http, BASE_PATH, config);
  let originalConsoleLog;
  let consoleLogMock;

  beforeAll(() => {
    originalConsoleLog = console.log;
    consoleLogMock = vi.fn();
    console.log = consoleLogMock;
  });

  afterEach(() => {
    nock.abortPendingRequests();
    consoleLogMock.mockReset();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  it('Invokes error endpoint in backend', async () => {
    nock(BASE_PATH).post(PATH_API_LOG_ERROR).reply(200);
    const logger = createLogger();
    await logger._error('En feil oppstod', { skjemanummer: 'NAV 12.34-56' });
    expect(nock.isDone()).toBe(true);
  });

  it('Invokes info endpoint in backend', async () => {
    nock(BASE_PATH).post(PATH_API_LOG_INFO).reply(200);
    const logger = createLogger();
    await logger._info('Bruker klikket publiser', { skjemanummer: 'NAV 12.34-56' });
    expect(nock.isDone()).toBe(true);
  });

  it('Ignores backend failure', async () => {
    nock(BASE_PATH).post(PATH_API_LOG_ERROR).reply(500);
    const logger = createLogger();
    await logger._error('En feil oppstod', { skjemanummer: 'NAV 12.34-56' });
    expect(nock.isDone()).toBe(true);
  });

  it('Disabled logger does not invoke backend', async () => {
    nock(BASE_PATH).post(PATH_API_LOG_ERROR).times(0);
    const logger = createLogger({ enabled: false });
    await logger._error('En feil oppstod');
    expect(nock.isDone()).toBe(true);
  });

  describe('browserOnly=true', () => {
    it('logs to console, not backend', async () => {
      nock(BASE_PATH).post(PATH_API_LOG_INFO).times(0);
      const logger = createLogger({ enabled: true, browserOnly: true });
      await logger._info('Info message');
      expect(consoleLogMock).toHaveBeenCalledTimes(1);
      expect(nock.isDone()).toBe(true);
    });

    it('respects config log level', async () => {
      const logger = createLogger({ enabled: true, browserOnly: true, logLevel: 'debug' });
      await logger._trace('Trace message', { trace: '1' });
      await logger._debug('Debug message', { debug: '1' });
      expect(consoleLogMock).toHaveBeenCalledTimes(1);
      expect(consoleLogMock).toHaveBeenNthCalledWith(1, 'Debug message', { debug: '1', level: 'debug' });
    });

    it('respects config flag enabled=false', async () => {
      const logger = createLogger({ enabled: false, browserOnly: true, logLevel: 'debug' });
      await logger._trace('Trace message', { trace: '1' });
      await logger._debug('Debug message', { debug: '1' });
      expect(consoleLogMock).toHaveBeenCalledTimes(0);
    });

    it('defaults to enabled=true and log level info', async () => {
      const logger = createLogger({ browserOnly: true });
      await logger._trace('Trace message', { trace: '1' });
      await logger._debug('Debug message', { debug: '1' });
      await logger._info('Info message', { info: '1' });
      expect(consoleLogMock).toHaveBeenCalledTimes(1);
      expect(consoleLogMock).toHaveBeenNthCalledWith(1, 'Info message', { info: '1', level: 'info' });
    });
  });
});
