import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
import { config } from '../config/config';
import { ConfigType } from '../config/types';
import { logger } from '../logger';
import { LogMetadata } from '../types/log';

type Severity = 'INFO' | 'WARN' | 'ERROR';

const TeamLogger = (config: ConfigType) => ({
  log: async (severity: Severity, message: string, metadata: LogMetadata) => {
    if (config.teamLogsConfig.enabled) {
      const correlation_id = correlator.getId();
      try {
        const response = await fetch(config.teamLogsConfig.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            severity,
            message,
            correlation_id,
            ...metadata,
            ...config.teamLogsConfig.mandatoryFields,
          }),
        });
        if (!response.ok) {
          logger.warn(`TeamLogger responded with status ${response.status} when sending log`, { correlation_id });
        }
      } catch (err) {
        logger.warn(`Failed to send log to TeamLogger: ${err}`, { correlation_id });
      }
    }
    return Promise.resolve();
  },
});

const instance = TeamLogger(config);

/**
 * Primarily used to log messages containing sensitive information.
 *
 * https://doc.nais.io/observability/logging/#team-logs
 */
const teamLogger = {
  error: async (message: string, metadata: LogMetadata = {}) => {
    return instance.log('ERROR', message, metadata);
  },
  warn: async (message: string, metadata: LogMetadata = {}) => {
    return instance.log('WARN', message, metadata);
  },
  info: async (message: string, metadata: LogMetadata = {}) => {
    return instance.log('INFO', message, metadata);
  },
};

export default teamLogger;
