import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
import { createLogger, format, transports } from 'winston';

const correlationIdFormat = format((info) => {
  info.correlation_id = correlator.getId();
  return info;
});

const logger = createLogger({
  level: process.env.FORM_SPEC_API_LOGLEVEL || (process.env.NODE_ENV === 'test' ? 'warning' : 'info'),
  silent: process.env.NODE_ENV === 'test',
  format: format.combine(correlationIdFormat(), format.json()),
  transports: [new transports.Console()],
});

export { logger };
