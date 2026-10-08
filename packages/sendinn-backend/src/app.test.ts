import request from 'supertest';
import { createApp } from './app';

const { authenticateMock, getDecoratorMock, getGlobalTranslationsMock } = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  getDecoratorMock: vi.fn(),
  getGlobalTranslationsMock: vi.fn(),
}));

vi.mock('./services', async () => {
  const { Registry } = await import('prom-client');
  return {
    decorator: { getDecorator: getDecoratorMock },
    idportenAuth: { authenticate: authenticateMock },
    metricsRegister: new Registry(),
    publishedTranslationService: { getGlobalTranslations: getGlobalTranslationsMock },
  };
});

const submissionId = '3f2a9c4e-8b1d-4e6f-9a7c-2d5b8e1f0c3a';

describe('sendinn-backend app', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDecoratorMock.mockResolvedValue({ DECORATOR_HEADER: '<header>decorator</header>' });
  });

  describe('index.html', () => {
    it.each([
      '/sendinn/lospost',
      '/sendinn/nav123456',
      '/sendinn/nav123456?lang=en',
      `/sendinn/lospost?innsendingsId=${submissionId}`,
    ])('renders %s with 200 without checking the session', async (url) => {
      const response = await request(createApp()).get(url).expect(200);

      expect(response.text).toContain('<header>decorator</header>');
      expect(response.header['x-robots-tag']).toBe('noindex');
      expect(authenticateMock).not.toHaveBeenCalled();
    });

    it.each([
      '/sendinn',
      '/sendinn/',
      '/sendinn/oppgave',
      '/sendinn/nav123456/extra',
      '/sendinn/NAV-123',
      '/sendinn/nav123456?innsendingsId=not-a-uuid',
    ])('renders %s with 404', async (url) => {
      await request(createApp()).get(url).expect(404);
      expect(authenticateMock).not.toHaveBeenCalled();
    });

    it.each([
      `/sendinn/oppgave?innsendingsId=${submissionId}`,
      `/sendinn/nav123456?innsendingsId=${submissionId}&lang=nn`,
    ])('redirects %s to sign-in with a relative return path when there is no session', async (url) => {
      authenticateMock.mockResolvedValue(undefined);

      const response = await request(createApp()).get(url).expect(302);

      expect(response.header.location).toBe(`/sendinn/oauth2/login?redirect=${encodeURIComponent(url)}`);
    });

    it('renders a task entry when the session is valid', async () => {
      authenticateMock.mockResolvedValue({ pid: '12345678910', token: 'token' });

      await request(createApp()).get(`/sendinn/oppgave?innsendingsId=${submissionId}`).expect(200);
    });
  });

  describe('api', () => {
    it('returns frontend-safe config', async () => {
      const response = await request(createApp()).get('/sendinn/api/config').expect(200);

      expect(response.body).toEqual({
        FEATURE_TOGGLES: {},
        featureToggles: {},
        isDevelopment: false,
        isProdGcp: false,
        loggerConfig: { enabled: true, logLevel: 'info', browserOnly: false },
      });
    });

    it('returns global translations for a supported language', async () => {
      getGlobalTranslationsMock.mockResolvedValue({ Avbryt: { en: 'Cancel' } });

      const response = await request(createApp()).get('/sendinn/api/global-translations/en').expect(200);

      expect(response.body).toEqual({ Avbryt: { en: 'Cancel' } });
      expect(getGlobalTranslationsMock).toHaveBeenCalledWith('en');
    });

    it('rejects unsupported languages with 400', async () => {
      await request(createApp()).get('/sendinn/api/global-translations/se').expect(400);
      expect(getGlobalTranslationsMock).not.toHaveBeenCalled();
    });

    it('accepts frontend log entries', async () => {
      await request(createApp()).post('/sendinn/api/log/info').send({ message: 'hello' }).expect(200);
    });
  });

  describe('internal', () => {
    it.each(['/sendinn/internal/isAlive', '/sendinn/internal/isReady'])('%s returns 200', async (url) => {
      await request(createApp()).get(url).expect(200);
    });

    it('exposes metrics', async () => {
      const response = await request(createApp()).get('/sendinn/internal/metrics').expect(200);
      expect(response.header['content-type']).toMatch(/text\/plain/);
    });
  });
});
