import { describe, expect, it } from 'vitest';
import { naisClusterUtil } from './naisClusterUtil';

describe('naisClusterUtil', () => {
  describe('allowSyntheticIdentityNumbers', () => {
    it('rejects synthetic identity numbers in production', () => {
      expect(naisClusterUtil.allowSyntheticIdentityNumbers('prod-gcp')).toBe(false);
    });

    it('allows synthetic identity numbers in every other cluster', () => {
      expect(naisClusterUtil.allowSyntheticIdentityNumbers('dev-gcp')).toBe(true);
      expect(naisClusterUtil.allowSyntheticIdentityNumbers('labs-gcp')).toBe(true);
    });

    it('allows synthetic identity numbers when no cluster is set', () => {
      expect(naisClusterUtil.allowSyntheticIdentityNumbers(undefined)).toBe(true);
    });
  });
});
