import ecsFormat from '@elastic/ecs-morgan-format';
import correlator from 'express-correlation-id';
import morgan from 'morgan';
import nodeProcess from 'node:process';
import { config } from '../config/config';
import { isEnabled } from '../logging';
import { clean } from '../utils/logCleaning.js';

const { isTest } = config;

const INTERNAL_PATHS = /.*\/(internal|static)\/.*/i;
const httpRequestLogger = morgan(
  (tokens, req, res) => {
    const logEntry = JSON.parse(ecsFormat({ apmIntegration: false })(tokens, req, res));
    return JSON.stringify(
      clean({
        ...logEntry,
        level: res.statusCode < 500 ? 'Info' : 'Error',
        correlation_id: correlator.getId(),
        node_worker_pid: nodeProcess.pid,
      }),
    );
  },
  {
    skip: (req, res) => isTest || INTERNAL_PATHS.test(req.originalUrl) || (res.statusCode < 500 && !isEnabled('info')),
  },
);

export default httpRequestLogger;
