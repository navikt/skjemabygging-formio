import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Sendinn content source configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NAIS_CLUSTER_NAME', 'dev-gcp');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(['published', 'latest'])('accepts the explicit %s source', async (source) => {
    vi.stubEnv('SENDINN_CONTENT_SOURCE', source);
    const { config } = await import('./config');

    expect(config.contentSource).toBe(source);
  });

  it.each([undefined, '', 'static', 'formsapi-staging', 'LATEST'])(
    'rejects missing or unknown source %s',
    async (source) => {
      vi.stubEnv('SENDINN_CONTENT_SOURCE', source);

      await expect(import('./config')).rejects.toThrow(/SENDINN_CONTENT_SOURCE/);
    },
  );

  it('rejects latest content in the production cluster', async () => {
    vi.stubEnv('NAIS_CLUSTER_NAME', 'prod-gcp');
    vi.stubEnv('SENDINN_CONTENT_SOURCE', 'latest');

    await expect(import('./config')).rejects.toThrow('SENDINN_CONTENT_SOURCE must be published in prod-gcp');
  });

  it('accepts published content in the production cluster', async () => {
    vi.stubEnv('NAIS_CLUSTER_NAME', 'prod-gcp');
    vi.stubEnv('SENDINN_CONTENT_SOURCE', 'published');

    await expect(import('./config')).resolves.toMatchObject({ config: { contentSource: 'published' } });
  });
});
