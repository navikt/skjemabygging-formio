import { LogLevel, loggingUtils } from '@navikt/skjemadigitalisering-shared-domain';
import baseHttp from '../util/http/http';

type BaseHttp = typeof baseHttp;

const noop = () => {};

export type LoggerConfig = Record<string, string | boolean>;

class FrontendLogger {
  private readonly http: BaseHttp;
  private readonly baseUrl: string;
  private readonly config: LoggerConfig;
  private readonly logLevelIsEnabled: (level: LogLevel) => boolean;

  constructor(http: BaseHttp, baseUrl: string = '', config: LoggerConfig = {}) {
    this.http = http;
    this.baseUrl = baseUrl;
    this.config = {
      browserOnly: config.browserOnly ?? false,
      logLevel: config.logLevel || 'info',
      enabled: config.enabled ?? true,
    };
    this.logLevelIsEnabled = loggingUtils.logLevelIsEnabled(this.config.logLevel as LogLevel);
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

  private async log(level: LogLevel, message: string, metadata?: object) {
    if (this.config.enabled && this.logLevelIsEnabled(level)) {
      if (this.config.browserOnly) {
        console.log(message, { ...metadata, level });
      } else {
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
