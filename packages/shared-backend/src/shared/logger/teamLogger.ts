import correlator from 'express-correlation-id';
import http from '../http/http';
import { logger } from './logger';

type Severity = 'INFO' | 'WARN' | 'ERROR';
type LogMetadata = Record<string, string | number | boolean | undefined>;

const url = process.env.TEAM_LOGS_URL;
const enabled = Boolean(url) && process.env.NODE_ENV !== 'test';
const mandatoryFields = {
  google_cloud_project: process.env.GOOGLE_CLOUD_PROJECT,
  nais_namespace_name: process.env.NAIS_NAMESPACE,
  nais_pod_name: process.env.NAIS_POD_NAME,
  nais_container_name: process.env.NAIS_APP_NAME,
};

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
        ...mandatoryFields,
      },
      {
        contentType: 'application/json',
      },
    );
  } catch (error) {
    if (error instanceof Error) {
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
