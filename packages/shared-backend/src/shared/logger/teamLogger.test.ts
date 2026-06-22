import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('teamLogger', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  const setup = async ({
    teamLogsUrl = 'http://team-logs.nais-system/',
    nodeEnv = 'development',
    googleCloudProject = 'project-1',
    naisNamespace = 'namespace-1',
    naisPodName = 'pod-1',
    naisAppName = 'app-1',
    postImpl = vi.fn().mockResolvedValue(undefined),
    warnImpl = vi.fn(),
    getIdImpl = vi.fn().mockReturnValue('corr-1'),
  } = {}) => {
    process.env = {
      ...originalEnv,
      TEAM_LOGS_URL: teamLogsUrl,
      NODE_ENV: nodeEnv,
      GOOGLE_CLOUD_PROJECT: googleCloudProject,
      NAIS_NAMESPACE: naisNamespace,
      NAIS_POD_NAME: naisPodName,
      NAIS_APP_NAME: naisAppName,
    };

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
      teamLogger: module.teamLogger,
      postImpl,
      warnImpl,
      getIdImpl,
    };
  };

  it('does nothing in test mode even when TEAM_LOGS_URL is set', async () => {
    const { teamLogger, postImpl } = await setup({ nodeEnv: 'test' });

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
