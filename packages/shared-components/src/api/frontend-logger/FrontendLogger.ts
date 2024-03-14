import baseHttp from '../util/http/http';

type LogLevel = 'info' | 'error' | 'debug' | 'trace';
const LogLevelRank: Record<LogLevel, number> = {
  trace: 1,
  debug: 2,
  info: 3,
  error: 4,
};
const atLeastInfo = (level: LogLevel) => LogLevelRank[level] >= LogLevelRank['info'];

type BaseHttp = typeof baseHttp;

const noop = () => {};

export type LoggerConfig = Record<string, string | boolean>;

class FrontendLogger {
  private readonly http: BaseHttp;
  private readonly baseUrl: string;
  private readonly config: LoggerConfig;

  constructor(http: BaseHttp, baseUrl: string = '', config: LoggerConfig = {}) {
    //enabled: boolean = false, options: OptionsParam = {browserOnly: false, logLevel: 'info'}) {
    this.http = http;
    this.baseUrl = baseUrl;
    this.config = {
      browserOnly: false,
      logLevel: 'info',
      enabled: true,
      ...config,
    };
  }

  trace(message: string, metadata?: object) {
    this._trace(message, metadata).then(noop);
  }

  debug(message: string, metadata?: object) {
    this._debug(message, metadata).then(noop);
  }

  info(message: string, metadata?: object) {
    this._info(message, metadata).then(noop);
  }

  error(message: string, metadata?: object) {
    this._error(message, metadata).then(noop);
  }

  async _trace(message: string, metadata?: object) {
    return this.log('trace', message, metadata);
  }

  async _debug(message: string, metadata?: object) {
    return this.log('debug', message, metadata);
  }

  async _info(message: string, metadata?: object) {
    return this.log('info', message, metadata);
  }

  async _error(message: string, metadata?: object) {
    return this.log('error', message, metadata);
  }

  shouldLog(level: LogLevel) {
    return LogLevelRank[level] >= LogLevelRank[this.config.logLevel as string];
  }

  private async log(level: LogLevel, message: string, metadata?: object) {
    if (this.config.enabled && this.shouldLog(level)) {
      if (this.config.browserOnly) {
        console.log(message, { ...metadata, level });
      } else if (atLeastInfo(level)) {
        return this.http
          .post(`${this.baseUrl}/api/log/${level}`, {
            message,
            metadata,
          })
          .catch(noop);
      }
    }
    return Promise.resolve();
  }
}

export default FrontendLogger;
