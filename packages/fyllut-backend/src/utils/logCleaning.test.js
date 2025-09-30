import { clean } from './logCleaning.js';
import logStatement1 from './testdata/log-statement-1.js';

const replace = (logStatement, map) => {
  let str = JSON.stringify(logStatement1);
  Object.keys(map).forEach((key) => {
    str = str.replace(key, map[key]);
  });
  return JSON.parse(str);
};

describe('logCleaning', () => {
  describe('clean', () => {
    it('replaces certain keys which value should not appear in logs', () => {
      const cleaned = clean(logStatement1);
      expect(JSON.stringify(cleaned)).not.toContain('Bearer 123456789'); // Authorization
      expect(JSON.stringify(cleaned)).not.toContain('Complete-azure-access-token'); // AzureAccessToken
      expect(JSON.stringify(cleaned)).not.toContain('127.0.0.101'); // x-client-ip
      expect(JSON.stringify(cleaned)).not.toContain('_ga='); // Cookie
      expect(JSON.stringify(cleaned)).not.toContain('Token-for-pdf-service'); // Token
      expect(JSON.stringify(cleaned)).not.toContain('Token-for-pdf-merge-service'); // Token
    });

    it('is case-insensitive', () => {
      const cleaned = clean(
        replace(logStatement1, {
          Authorization: 'authorization',
        }),
      );
      expect(JSON.stringify(cleaned)).not.toContain('Bearer 123456789');
      expect(JSON.stringify(cleaned)).not.toContain('Complete-azure-access-token');
    });
  });
});
