import correlator from 'express-correlation-id';
import http, { HttpResponseError } from '../http/http';
import { logger } from './logger';

type Severity = 'INFO' | 'WARN' | 'ERROR';
type LogMetadata = Record<string, string | number | boolean | undefined>;

const url = process.env.TEAM_LOGS_URL;
const enabled = Boolean(url) && process.env.NODE_ENV !== 'test';

const log = async (severity: Severity, message: string, metadata: LogMetadata = {}) => {
  if (!enabled || !url) {
    return Promise.resolve();
  }

  try {
    await http.post(
      url,
      {
        severity,
        message,
        correlation_id: correlator.getId(),
        ...metadata,
      },
      {
        contentType: 'application/json',
      },
    );
  } catch (error) {
    if (error instanceof HttpResponseError || error instanceof Error) {
      logger.warn('Failed to post to team-logs', { error });
      return Promise.resolve();
    }

    logger.warn('Failed to post to team-logs', { error: String(error) });
  }

  return Promise.resolve();
};

const teamLogger = {
  error: async (message: string, metadata: LogMetadata = {}) => log('ERROR', message, metadata),
  warn: async (message: string, metadata: LogMetadata = {}) => log('WARN', message, metadata),
  info: async (message: string, metadata: LogMetadata = {}) => log('INFO', message, metadata),
};

export { teamLogger };
export type { LogMetadata };
