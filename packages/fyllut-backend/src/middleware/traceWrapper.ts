import { SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { NextFunction, Request, Response } from 'express';
import { logErrorWithStacktrace } from '../utils/errors';

const traceWrapper = (spanName: string, fn: Function) => async (req: Request, res: Response, next: NextFunction) => {
  const tracer = trace.getTracer(process.env.NAIS_APP_NAME!);
  const spanOptions = {
    kind: SpanKind.INTERNAL,
    attributes: {
      'http.target': req.originalUrl,
      'http.query': JSON.stringify(req.query || {}),
      'http.request_content_type': req.get('content-type'),
      'http.request_content_length': req.get('content-length'),
    },
  };
  await tracer.startActiveSpan(spanName, spanOptions, async (span) => {
    try {
      await fn(req, res, next);
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (err: any) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
      logErrorWithStacktrace(err);
      throw err;
    } finally {
      span.end();
    }
  });
};

export default traceWrapper;
