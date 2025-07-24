import NodeCache from 'node-cache';
import { logger } from '../../logger';
import { Cache } from './types';

export function getLocalCache(): Cache {
  logger.info('Creating local cache');
  const cache = new NodeCache();

  return {
    get: async (key: string) => {
      logger.debug('Fetching from local cache');
      return cache.get(key) ?? null;
    },
    set: async (key: string, value: string, ttlSeconds: number) => {
      cache.set(key, value, ttlSeconds);
      return Promise.resolve('OK');
    },
    del: async (key: string) => {
      const result = cache.del(key);
      return Promise.resolve(result ? 1 : 0);
    },
    isReady: () => true,
  };
}
