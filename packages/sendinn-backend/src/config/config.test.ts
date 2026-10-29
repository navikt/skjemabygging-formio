import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('dotenv', () => ({ default: { config: vi.fn() } }));

describe('Sendinn content source configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'test');
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

  it.each(['development', 'test'])('defaults to latest in %s when the source is missing', async (nodeEnv) => {
    vi.stubEnv('NODE_ENV', nodeEnv);
    vi.stubEnv('SENDINN_CONTENT_SOURCE', undefined);

    const { config } = await import('./config');

    expect(config.contentSource).toBe('latest');
  });

  it('requires an explicit source outside development and test', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('FORMS_API_URL', 'https://forms-api.example.com');
    vi.stubEnv('NORG2_URL', 'https://norg2.example.com');
    vi.stubEnv('SENDINN_CONTENT_SOURCE', undefined);

    await expect(import('./config')).rejects.toThrow('Missing required environment variable: SENDINN_CONTENT_SOURCE');
  });

  it.each(['', 'static', 'formsapi-staging', 'LATEST'])('rejects empty or unknown source %s', async (source) => {
    vi.stubEnv('SENDINN_CONTENT_SOURCE', source);

    await expect(import('./config')).rejects.toThrow(/SENDINN_CONTENT_SOURCE/);
  });

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
