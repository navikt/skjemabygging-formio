import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TeamLoggerConfig } from './teamLogger';

describe('teamLogger', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  const setup = async ({
    config = {
      enabled: true,
      url: 'http://team-logs.nais-system/',
      mandatoryFields: {
        google_cloud_project: 'project-1',
        nais_namespace_name: 'namespace-1',
        nais_pod_name: 'pod-1',
        nais_container_name: 'app-1',
      },
    },
    postImpl = vi.fn().mockResolvedValue(undefined),
    warnImpl = vi.fn(),
    getIdImpl = vi.fn().mockReturnValue('corr-1'),
  }: {
    config?: TeamLoggerConfig;
    postImpl?: ReturnType<typeof vi.fn>;
    warnImpl?: ReturnType<typeof vi.fn>;
    getIdImpl?: ReturnType<typeof vi.fn>;
  } = {}) => {
    vi.doMock('../http/http', () => ({
      default: {
        post: postImpl,
      },
    }));
    vi.doMock('./logger', () => ({
      logger: {
        warn: warnImpl,
      },
    }));
    vi.doMock('express-correlation-id', () => ({
      default: {
        getId: getIdImpl,
      },
    }));

    const module = await import('./teamLogger');
    return {
      teamLogger: module.createTeamLogger(config),
      postImpl,
      warnImpl,
      getIdImpl,
    };
  };

  it('does nothing when disabled', async () => {
    const { teamLogger, postImpl } = await setup({ config: { enabled: false, url: '', mandatoryFields: {} } });

    await teamLogger.error('Could not create pdf', { skjemanummer: 'NAV 00-00.00' });

    expect(postImpl).not.toHaveBeenCalled();
  });

  it('posts expected body for enabled logger', async () => {
    const { teamLogger, postImpl } = await setup();

    await teamLogger.warn('Something happened', { skjemanummer: 'NAV 00-00.00', ok: true });

    expect(postImpl).toHaveBeenCalledWith(
      'http://team-logs.nais-system/',
      {
        severity: 'WARN',
        message: 'Something happened',
        correlation_id: 'corr-1',
        skjemanummer: 'NAV 00-00.00',
        ok: true,
        google_cloud_project: 'project-1',
        nais_namespace_name: 'namespace-1',
        nais_pod_name: 'pod-1',
        nais_container_name: 'app-1',
      },
      {
        contentType: 'application/json',
      },
    );
  });

  it('swallows network errors and logs warning', async () => {
    const postImpl = vi.fn().mockRejectedValue(new Error('network down'));
    const { teamLogger, warnImpl } = await setup({ postImpl });

    await expect(teamLogger.info('hello')).resolves.toBeUndefined();

    expect(warnImpl).toHaveBeenCalledWith('Failed to post to team-logs', {
      error: expect.any(Error),
    });
  });

  it('uses current correlation id for each call', async () => {
    const getIdImpl = vi.fn().mockReturnValueOnce('corr-1').mockReturnValueOnce('corr-2');
    const { teamLogger, postImpl } = await setup({ getIdImpl });

    await teamLogger.info('first');
    await teamLogger.error('second');

    expect(postImpl).toHaveBeenNthCalledWith(
      1,
      'http://team-logs.nais-system/',
      expect.objectContaining({ severity: 'INFO', correlation_id: 'corr-1' }),
      { contentType: 'application/json' },
    );
    expect(postImpl).toHaveBeenNthCalledWith(
      2,
      'http://team-logs.nais-system/',
      expect.objectContaining({ severity: 'ERROR', correlation_id: 'corr-2' }),
      { contentType: 'application/json' },
    );
  });
});
