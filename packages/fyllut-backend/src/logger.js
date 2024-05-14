import correlator from 'express-correlation-id';
import nodeProcess from 'node:process';
import { createLogger, format, transports } from 'winston';

const commonFormat = format((info) => {
  info.correlation_id = correlator.getId();
  info.node_worker_pid = nodeProcess.pid;
  return info;
});

export const logger = createLogger({
  level: process.env.FYLLUT_BACKEND_LOGLEVEL || (process.env.NODE_ENV === 'test' ? 'warning' : 'info'),
  format: format.combine(commonFormat(), format.json()),
  transports: [new transports.Console()],
});
