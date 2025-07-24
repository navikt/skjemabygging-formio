import { config } from '../../config/config';
import { getLocalCache } from './localcache';
import { createValkeyInstance } from './valkey';

async function createCache() {
  if (config.valkey.enabled) {
    return createValkeyInstance();
  }
  return getLocalCache();
}

export { createCache };
