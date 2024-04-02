import {
  FrontendLoggerConfigType,
  LogContext,
  LogLevel,
  LogTag,
  loggingUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import baseHttp from '../util/http/http';

type BaseHttp = typeof baseHttp;

const noop = () => {};

class FrontendLogger {
  private readonly http: BaseHttp;
  private readonly baseUrl: string;
  private readonly config: FrontendLoggerConfigType;
  private readonly logLevelIsEnabled: (level: LogLevel) => boolean;

  constructor(http: BaseHttp, baseUrl: string = '', config: Partial<FrontendLoggerConfigType> = {}) {
    this.http = http;
    this.baseUrl = baseUrl;
    this.config = {
      browserOnly: config.browserOnly ?? false,
      logLevel: config.logLevel || 'info',
      enabled: config.enabled ?? true,
      filterTags: config.filterTags ?? [],
    };
    this.logLevelIsEnabled = loggingUtils.logLevelIsEnabled(this.config.logLevel as LogLevel);
  }

  trace(message: string, metadata?: LogContext) {
    this._trace(message, metadata).then(noop);
  }

  debug(message: string, metadata?: LogContext) {
    this._debug(message, metadata).then(noop);
  }

  info(message: string, metadata?: LogContext) {
    this._info(message, metadata).then(noop);
  }

  error(message: string, metadata?: LogContext) {
    this._error(message, metadata).then(noop);
  }

  async _trace(message: string, metadata?: LogContext) {
    return this.log('trace', message, metadata);
  }

  async _debug(message: string, metadata?: LogContext) {
    return this.log('debug', message, metadata);
  }

  async _info(message: string, metadata?: LogContext) {
    return this.log('info', message, metadata);
  }

  async _error(message: string, metadata?: LogContext) {
    return this.log('error', message, metadata);
  }

  tagsIncluded(tags: LogTag[] = []) {
    const filterTags = this.config.filterTags;
    return !filterTags.length || filterTags.some((t) => tags.includes(t));
  }

  private async log(level: LogLevel, message: string, metadata?: LogContext) {
    if (this.config.enabled && this.logLevelIsEnabled(level) && this.tagsIncluded(metadata?.tags)) {
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
