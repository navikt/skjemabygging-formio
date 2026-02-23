import correlator from 'express-correlation-id';
import { createLogger, format, transports } from 'winston';

const correlationIdFormat = format((info) => {
  info.correlation_id = correlator.getId();
  return info;
});

export const logger = createLogger({
  level:
    process.env.FYLLUT_BACKEND_LOGLEVEL ||
    process.env.BYGGER_BACKEND_LOGLEVEL ||
    (process.env.NODE_ENV === 'test' ? 'warning' : 'info'),
  silent: process.env.NODE_ENV === 'test',
  format: format.combine(correlationIdFormat(), format.json()),
  transports: [new transports.Console()],
});
