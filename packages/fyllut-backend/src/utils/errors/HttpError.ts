export class HttpError extends Error {
  functional?: boolean;
  correlation_id?: string;
  http_response_body?: any;
  http_url?: string;
  http_status?: number;
  render_html?: boolean;

  constructor(errorMessage: string) {
    super(errorMessage);
  }
}
