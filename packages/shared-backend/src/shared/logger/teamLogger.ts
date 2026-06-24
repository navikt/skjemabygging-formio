import correlator from 'express-correlation-id';
import http from '../http/http';
import { logger } from './logger';

type Severity = 'INFO' | 'WARN' | 'ERROR';
type LogMetadata = Record<string, string | number | boolean | undefined>;
type TeamLoggerConfig = {
  enabled: boolean;
  url: string;
  mandatoryFields: Record<string, string>;
};

type TeamLogger = {
  error: (message: string, metadata?: LogMetadata) => Promise<void>;
  warn: (message: string, metadata?: LogMetadata) => Promise<void>;
  info: (message: string, metadata?: LogMetadata) => Promise<void>;
};

const createTeamLogger = (config: TeamLoggerConfig): TeamLogger => {
  const log = async (severity: Severity, message: string, metadata: LogMetadata = {}) => {
    if (!config.enabled || !config.url) {
      return Promise.resolve();
    }

    try {
      await http.post(
        config.url,
        {
          severity,
          message,
          correlation_id: correlator.getId(),
          ...metadata,
          ...config.mandatoryFields,
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

  return {
    error: async (message: string, metadata: LogMetadata = {}) => log('ERROR', message, metadata),
    warn: async (message: string, metadata: LogMetadata = {}) => log('WARN', message, metadata),
    info: async (message: string, metadata: LogMetadata = {}) => log('INFO', message, metadata),
  };
};

export { createTeamLogger };
export type { LogMetadata, TeamLogger, TeamLoggerConfig };
