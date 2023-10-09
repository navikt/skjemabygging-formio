import { MockedFunction } from 'vitest';
import { checkConfigConsistency } from './config';
import { NaisCluster } from './nais-cluster.js';
import { ConfigType } from './types';

describe('config', () => {
  let logError: MockedFunction<any>;
  let exit: MockedFunction<any>;

  beforeEach(() => {
    logError = vi.fn();
    exit = vi.fn();
  });

  test('FormioApi er ikke tillatt i prod', () => {
    const config = {
      useFormioApi: true,
      naisClusterName: NaisCluster.PROD,
    } as ConfigType;
    // @ts-ignore
    checkConfigConsistency(config, logError, exit);
    expect(logError).toBeCalledWith('FormioApi is not allowed in prod-gcp');
    expect(exit).toBeCalledWith(1);
  });

  test('SkjemaUrl er påkrevd når FormioApi skal brukes i dev', () => {
    const config = {
      useFormioApi: true,
      naisClusterName: NaisCluster.DEV,
    } as ConfigType;
    // @ts-ignore
    checkConfigConsistency(config, logError, exit);
    expect(logError).toBeCalledWith('FORMIO_PROJECT_URL is required when using FormioApi');
    expect(exit).toBeCalledWith(1);
  });

  test('FormioApi er tillatt i dev', () => {
    const config = {
      useFormioApi: true,
      naisClusterName: NaisCluster.DEV,
      formioProjectUrl: 'https://form.io',
    } as ConfigType;
    // @ts-ignore
    checkConfigConsistency(config, logError, exit);
    expect(logError).not.toBeCalled();
    expect(exit).not.toBeCalled();
  });
});
