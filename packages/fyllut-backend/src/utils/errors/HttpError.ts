import type { Response as NodeFetchResponse } from 'node-fetch';
import { FunctionalError } from './FunctionalError';

export class HttpError extends FunctionalError {
  http_response_body?: any;
  http_url?: string;
  http_status?: number;
  render_html?: boolean;

  constructor(errorMessage: string, functional: boolean = false, renderHtml: boolean = false) {
    super(errorMessage, functional);
    this.render_html = renderHtml;
  }

  async applyResponse(response: Response | NodeFetchResponse) {
    if (response && response.headers) {
      const contentType = response.headers.get('content-type');
      this.http_response_body = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();
      this.http_url = response.url;
      this.http_status = response.status;
    }
  }
}
