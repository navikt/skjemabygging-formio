import correlator from 'express-correlation-id';
import { config } from '../config/config';
import { logErrorWithStacktrace } from '../utils/errors';

const { isTest } = config;

const createJson = (err) => {
  return {
    message: err.functional ? err.message : 'Det oppstod en feil',
    correlation_id: err.correlation_id,
  };
};

const createHtml = (err) => {
  const paragraphs = err.html_paragraphs;
  const title = err.html_title;
  return `
    <html lang="nb">
    <head><title>${title}</title></head>
    <body>${paragraphs.map((pContent) => `<p>${pContent}</p>`).join('')}</body>
    </html>`;
};

const globalErrorHandler = (err, req, res, _next) => {
  if (!err.correlation_id) {
    err.correlation_id = correlator.getId();
  }

  if (!isTest) {
    logErrorWithStacktrace(err);
  }

  res.status(500);
  const shouldReturnHtml = err.html_paragraphs?.length > 0;
  res.contentType(shouldReturnHtml ? 'text/html' : 'application/json');
  res.send(shouldReturnHtml ? createHtml(err) : createJson(err));
};

export default globalErrorHandler;
