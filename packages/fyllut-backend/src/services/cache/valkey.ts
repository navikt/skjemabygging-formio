import Redis, { RedisOptions } from 'iovalkey';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { Cache } from './types';

export const createValkeyInstance: () => Cache = () => {
  if (!config.valkey.enabled) {
    const errorMessage = '[Valkey] Valkey is not enabled in the configuration';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  logger.info('[Valkey] Creating valkey instance');
  try {
    const options: RedisOptions = {
      username: config.valkey.username,
      password: config.valkey.password,
      tls: {
        host: config.valkey.host,
        port: config.valkey.port,
      },
      showFriendlyErrorStack: true,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      retryStrategy: (times: number) => {
        if (times > 3) {
          throw new Error(`[Valkey] Could not connect after ${times} attempts`);
        }

        return Math.min(times * 200, 1000);
      },
    };

    const instance = new Redis(options);

    instance.on('error', (error: unknown) => {
      logger.warn('[Valkey] Error connecting' + error, error);
    });

    instance.on('ready', () => {
      logger.info('[Valkey] Valkey cache initialized');
    });

    return {
      get: (key: string) => instance.get(key),
      set: (key: string, value: string, ttlSeconds: number) => instance.set(key, value, 'EX', ttlSeconds),
      del: (key: string) => instance.del(key),
      isReady: () => instance.status == 'ready',
    };
  } catch (e) {
    logger.error(e);
    throw new Error(`[Valkey] Could not create a Valkey instance`);
  }
};
