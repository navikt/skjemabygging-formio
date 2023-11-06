import baseHttp from '../util/http/http';

type LogLevel = 'info' | 'error';
type BaseHttp = typeof baseHttp;

const noop = () => {};

class FrontendLogger {
  private readonly http: BaseHttp;
  private readonly baseUrl: string;
  private readonly enabled: boolean;

  constructor(http: BaseHttp, baseUrl: string = '', enabled: boolean = false) {
    this.http = http;
    this.baseUrl = baseUrl;
    this.enabled = enabled;
  }

  info(message: string, metadata?: object) {
    this._info(message, metadata).then(noop);
  }

  error(message: string, metadata?: object) {
    this._error(message, metadata).then(noop);
  }

  async _info(message: string, metadata?: object) {
    return this.log('info', message, metadata);
  }

  async _error(message: string, metadata?: object) {
    return this.log('error', message, metadata);
  }

  private async log(level: LogLevel, message: string, metadata?: object) {
    if (this.enabled) {
      return this.http
        .post(`${this.baseUrl}/api/log/${level}`, {
          message,
          metadata,
        })
        .catch(noop);
    }
    return Promise.resolve();
  }
}

export default FrontendLogger;
