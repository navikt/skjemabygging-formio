import { loggingUtils } from './loggingUtils';

describe('LogLevel', () => {
  describe('logLevelIsEnabled', () => {
    it('configLevel trace', () => {
      const isEnabled = loggingUtils.logLevelIsEnabled('trace');
      expect(isEnabled('trace')).toBe(true);
      expect(isEnabled('debug')).toBe(true);
      expect(isEnabled('info')).toBe(true);
      expect(isEnabled('warning')).toBe(true);
      expect(isEnabled('error')).toBe(true);
    });

    it('configLevel debug', () => {
      const isEnabled = loggingUtils.logLevelIsEnabled('debug');
      expect(isEnabled('trace')).toBe(false);
      expect(isEnabled('debug')).toBe(true);
      expect(isEnabled('info')).toBe(true);
      expect(isEnabled('warning')).toBe(true);
      expect(isEnabled('error')).toBe(true);
    });

    it('configLevel info', () => {
      const isEnabled = loggingUtils.logLevelIsEnabled('info');
      expect(isEnabled('trace')).toBe(false);
      expect(isEnabled('debug')).toBe(false);
      expect(isEnabled('info')).toBe(true);
      expect(isEnabled('warning')).toBe(true);
      expect(isEnabled('error')).toBe(true);
    });

    it('configLevel warning', () => {
      const isEnabled = loggingUtils.logLevelIsEnabled('warning');
      expect(isEnabled('trace')).toBe(false);
      expect(isEnabled('debug')).toBe(false);
      expect(isEnabled('info')).toBe(false);
      expect(isEnabled('warning')).toBe(true);
      expect(isEnabled('error')).toBe(true);
    });

    it('configLevel error', () => {
      const isEnabled = loggingUtils.logLevelIsEnabled('error');
      expect(isEnabled('trace')).toBe(false);
      expect(isEnabled('debug')).toBe(false);
      expect(isEnabled('info')).toBe(false);
      expect(isEnabled('warning')).toBe(false);
      expect(isEnabled('error')).toBe(true);
    });
  });
});
