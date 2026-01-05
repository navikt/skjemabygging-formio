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

  test('FormsApi staging er ikke tillatt i prod', () => {
    const config = {
      useFormsApiStaging: true,
      naisClusterName: NaisCluster.PROD,
    } as ConfigType;
    checkConfigConsistency(config, logError, exit as any);
    expect(logError).toBeCalledWith('Invalid configuration: FormsApi staging is not allowed in prod-gcp');
    expect(exit).toBeCalledWith(1);
  });

  test('SkjemaUrl er påkrevd når FormioApi skal brukes i dev', () => {
    const config = {
      mocksEnabled: true,
      naisClusterName: NaisCluster.DEV,
    } as ConfigType;
    checkConfigConsistency(config, logError, exit as any);
    expect(logError).toBeCalledWith('Invalid configuration: Formio api service url is required when mocks enabled');
    expect(exit).toBeCalledWith(1);
  });

  test('Forms API url er påkrevd når FormsApi staging skal brukes i dev', () => {
    const config = {
      useFormsApiStaging: true,
      naisClusterName: NaisCluster.DEV,
    } as ConfigType;
    checkConfigConsistency(config, logError, exit as any);
    expect(logError).toBeCalledWith('Invalid configuration: Forms api url is required when using FormsApi staging');
    expect(exit).toBeCalledWith(1);
  });

  test('FormsApi staging er tillatt i dev', () => {
    const config = {
      useFormsApiStaging: true,
      naisClusterName: NaisCluster.DEV,
      formsApiUrl: 'https://forms-api.no',
    } as ConfigType;
    checkConfigConsistency(config, logError, exit as any);
    expect(logError).not.toBeCalled();
    expect(exit).not.toBeCalled();
  });

  test('Mocks er ikke tillatt i prod-gcp', () => {
    const config = {
      mocksEnabled: true,
      naisClusterName: NaisCluster.PROD,
    } as ConfigType;
    checkConfigConsistency(config, logError, exit as any);
    expect(logError).toBeCalledWith('Invalid configuration: Mocks is not allowed in prod-gcp');
    expect(exit).toBeCalledWith(1);
  });

  test('Mocks er ikke tillatt i dev-gcp', () => {
    const config = {
      mocksEnabled: true,
      naisClusterName: NaisCluster.DEV,
    } as ConfigType;
    checkConfigConsistency(config, logError, exit as any);
    expect(logError).toBeCalledWith('Invalid configuration: Mocks is not allowed in dev-gcp');
    expect(exit).toBeCalledWith(1);
  });
});
