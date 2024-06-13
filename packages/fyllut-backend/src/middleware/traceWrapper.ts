import { SpanStatusCode, trace } from '@opentelemetry/api';
import { NextFunction, Request, Response } from 'express';
import { logErrorWithStacktrace } from '../utils/errors';

const traceWrapper = (spanName: string, fn: Function) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tracer = trace.getTracer(process.env.NAIS_APP_NAME!);
    await tracer.startActiveSpan(spanName, async (span) => {
      try {
        await fn(req, res, next);
        span.setAttributes({
          'http.target': req.originalUrl,
          'http.query': JSON.stringify(req.query || {}),
          'http.request_content_type': req.get('content-type'),
          'http.request_content_length': req.get('content-length'),
        });
        span.setStatus({ code: SpanStatusCode.OK });
      } catch (err: any) {
        logErrorWithStacktrace(err);
        span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
        next(err);
      } finally {
        span.end();
      }
    });
  } catch (err: any) {
    logErrorWithStacktrace(err);
    next(err);
  }
};

export default traceWrapper;
