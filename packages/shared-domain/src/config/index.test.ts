import { afterAll, beforeAll } from 'vitest';
import configUtils from './index';

const { loadJsonFromEnv } = configUtils;

describe('configUtils', () => {
  let originalConsoleWarn;
  let consoleWarnMock;

  beforeAll(() => {
    originalConsoleWarn = console.warn;
    consoleWarnMock = vi.fn();
    console.warn = consoleWarnMock;
  });

  afterEach(() => {
    consoleWarnMock.mockReset();
  });

  afterAll(() => {
    console.warn = originalConsoleWarn;
  });

  describe('loadJsonFromEnv', () => {
    const DEFAULT_VALUE = {};
    describe('env variable not present', () => {
      it('handles missing env variable', () => {
        const processEnvMock = {};
        const json = loadJsonFromEnv('TEST_CONFIG', DEFAULT_VALUE, processEnvMock);
        expect(json).toEqual(DEFAULT_VALUE);
      });

      it('handles undefined value', () => {
        const processEnvMock = {
          TEST_CONFIG: undefined,
        };
        const json = loadJsonFromEnv('TEST_CONFIG', DEFAULT_VALUE, processEnvMock);
        expect(json).toEqual(DEFAULT_VALUE);
      });

      it('handles empty value', () => {
        const processEnvMock = {
          TEST_CONFIG: '',
        };
        const json = loadJsonFromEnv('TEST_CONFIG', DEFAULT_VALUE, processEnvMock);
        expect(json).toEqual(DEFAULT_VALUE);
      });
    });

    it('handles invalid json', () => {
      const processEnvMock = {
        TEST_CONFIG: '{',
      };
      const json = loadJsonFromEnv('TEST_CONFIG', DEFAULT_VALUE, processEnvMock);
      expect(consoleWarnMock).toHaveBeenCalledOnce();
      expect(json).toEqual(DEFAULT_VALUE);
    });

    describe('json', () => {
      it('handles array', () => {
        const processEnvMock = {
          TEST_CONFIG: '[{"enabled": false}, {"enabled": true}]',
        };
        const json = loadJsonFromEnv('TEST_CONFIG', DEFAULT_VALUE, processEnvMock);
        expect(json).toEqual([{ enabled: false }, { enabled: true }]);
      });

      it('handles object with array', () => {
        const processEnvMock = {
          TEST_CONFIG: '{"enabled": true, "array": ["one","two"]}',
        };
        const json = loadJsonFromEnv('TEST_CONFIG', DEFAULT_VALUE, processEnvMock);
        expect(json).toEqual({ enabled: true, array: ['one', 'two'] });
      });
    });
  });
});
