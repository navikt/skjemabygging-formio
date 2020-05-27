import {QuipResponse} from "./FakeQuipResponse";

export class InprocessQuipApp {
  constructor(quipApp) {
    this.quipApp = quipApp;
  }
  normalizeHeaders(headers) {
    const result = {};
    Object.entries(headers).forEach(([key, value]) => {
      result[key.toLowerCase()] = value;
    });
    return result;
  }

  responseFor(url, options) {
    const response = new QuipResponse(url);
    const request = {
      url: url,
      method: options.method,
      headers: this.normalizeHeaders(options.headers),
      body: options.body
    };
    request.summary = function () { return `${this.method} ${this.url}`; };
    const next = () => {
      throw new Error(`${request.summary()} is unhandled`);
    };
    console.log('quip app before', request);
    this.quipApp(request, response, next);
    console.log('quip app after', response);
    return response.toFetchResponse();
  }

  fetchImpl = (url, options = {}) => {
    try {
      const response = this.responseFor(url, {
        ...{method: 'GET', headers: {}}, // defaults
        ...options
      });
      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  };

}
