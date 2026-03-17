import ecsFormat from '@elastic/ecs-morgan-format';
import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
import { context, trace } from '@opentelemetry/api';
import morgan from 'morgan';
import { config } from '../config/config';
import { isEnabled } from '../logging';
import { clean } from '../utils/logCleaning';

const { isTest } = config;

const INTERNAL_PATHS = /.*\/(internal|static)\/.*/i;
const formatEcsLog = ecsFormat({ apmIntegration: false, format: 'combined' });

const httpRequestLogger = morgan(
  (tokens, req, res) => {
    const logEntry = JSON.parse(formatEcsLog(tokens, req, res));
    const span = trace.getSpan(context.active());
    const traceId = span ? span.spanContext().traceId : undefined;
    return JSON.stringify(
      clean({
        ...logEntry,
        level: res.statusCode < 500 || res.locals?.errorAlreadyLogged ? 'Info' : 'Error',
        correlation_id: correlator.getId(),
        trace_id: traceId,
      }),
    );
  },
  {
    skip: (req, res) => isTest || INTERNAL_PATHS.test(req.originalUrl) || (res.statusCode < 500 && !isEnabled('info')),
  },
);

export default httpRequestLogger;
