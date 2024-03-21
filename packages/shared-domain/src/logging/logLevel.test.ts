import { logLevelIsEnabled } from './logLevel';

describe('logging', () => {
  describe('log level isEnabled', () => {
    it('backendLogLevel trace', () => {
      const isEnabled = logLevelIsEnabled('trace');
      expect(isEnabled('trace')).toBe(true);
      expect(isEnabled('debug')).toBe(true);
      expect(isEnabled('info')).toBe(true);
      expect(isEnabled('warning')).toBe(true);
      expect(isEnabled('error')).toBe(true);
    });
    it('backendLogLevel debug', () => {
      const isEnabled = logLevelIsEnabled('debug');
      expect(isEnabled('trace')).toBe(false);
      expect(isEnabled('debug')).toBe(true);
      expect(isEnabled('info')).toBe(true);
      expect(isEnabled('warning')).toBe(true);
      expect(isEnabled('error')).toBe(true);
    });
    it('backendLogLevel info', () => {
      const isEnabled = logLevelIsEnabled('info');
      expect(isEnabled('trace')).toBe(false);
      expect(isEnabled('debug')).toBe(false);
      expect(isEnabled('info')).toBe(true);
      expect(isEnabled('warning')).toBe(true);
      expect(isEnabled('error')).toBe(true);
    });
    it('backendLogLevel warning', () => {
      const isEnabled = logLevelIsEnabled('warning');
      expect(isEnabled('trace')).toBe(false);
      expect(isEnabled('debug')).toBe(false);
      expect(isEnabled('info')).toBe(false);
      expect(isEnabled('warning')).toBe(true);
      expect(isEnabled('error')).toBe(true);
    });
    it('backendLogLevel error', () => {
      const isEnabled = logLevelIsEnabled('error');
      expect(isEnabled('trace')).toBe(false);
      expect(isEnabled('debug')).toBe(false);
      expect(isEnabled('info')).toBe(false);
      expect(isEnabled('warning')).toBe(false);
      expect(isEnabled('error')).toBe(true);
    });
  });
});
