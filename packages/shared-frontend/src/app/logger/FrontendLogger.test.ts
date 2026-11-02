// @vitest-environment jsdom

import { afterAll, beforeAll } from 'vitest';
import http from '../http/http';
import FrontendLogger, { LoggerConfig } from './FrontendLogger';

const BASE_PATH = 'http://test.nav.no';
const PATH_API_LOG_ERROR = '/api/log/error';
const PATH_API_LOG_INFO = '/api/log/info';

const mockFetchStatus = (status: number) => vi.spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status }));

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
    vi.restoreAllMocks();
    consoleLogMock.mockReset();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  it('Invokes error endpoint in backend', async () => {
    const fetchSpy = mockFetchStatus(200);
    const logger = createLogger();
    await logger._error('En feil oppstod', { skjemanummer: 'NAV 12.34-56' });
    expect(fetchSpy).toHaveBeenCalledWith(
      `${BASE_PATH}${PATH_API_LOG_ERROR}`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('Invokes info endpoint in backend', async () => {
    const fetchSpy = mockFetchStatus(200);
    const logger = createLogger();
    await logger._info('Bruker klikket publiser', { skjemanummer: 'NAV 12.34-56' });
    expect(fetchSpy).toHaveBeenCalledWith(
      `${BASE_PATH}${PATH_API_LOG_INFO}`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('Ignores backend failure', async () => {
    const fetchSpy = mockFetchStatus(500);
    const logger = createLogger();
    await logger._error('En feil oppstod', { skjemanummer: 'NAV 12.34-56' });
    expect(fetchSpy).toHaveBeenCalledWith(
      `${BASE_PATH}${PATH_API_LOG_ERROR}`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('Disabled logger does not invoke backend', async () => {
    const fetchSpy = mockFetchStatus(200);
    const logger = createLogger({ enabled: false });
    await logger._error('En feil oppstod');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  describe('browserOnly=true', () => {
    it('logs to console, not backend', async () => {
      const fetchSpy = mockFetchStatus(200);
      const logger = createLogger({ enabled: true, browserOnly: true });
      await logger._info('Info message');
      expect(consoleLogMock).toHaveBeenCalledTimes(1);
      expect(fetchSpy).not.toHaveBeenCalled();
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
