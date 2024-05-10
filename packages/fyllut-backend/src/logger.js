import correlator from 'express-correlation-id';
import { v4 as uuidv4 } from 'uuid';
import { createLogger, format, transports } from 'winston';

const correlationIdFormat = format((info) => {
  info.correlation_id = correlator.getId() ?? uuidv4();
  return info;
});

export const logger = createLogger({
  level: process.env.FYLLUT_BACKEND_LOGLEVEL || (process.env.NODE_ENV === 'test' ? 'warning' : 'info'),
  format: format.combine(correlationIdFormat(), format.json()),
  transports: [new transports.Console()],
});
