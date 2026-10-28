import request from 'supertest';
import { createApp } from './app';

const { getDecoratorMock, getGlobalTranslationsMock } = vi.hoisted(() => ({
  getDecoratorMock: vi.fn(),
  getGlobalTranslationsMock: vi.fn(),
}));

vi.mock('./services', async () => {
  const { Registry } = await import('prom-client');
  return {
    decorator: { getDecorator: getDecoratorMock },
    idportenAuth: { authenticate: vi.fn() },
    metricsRegister: new Registry(),
    publishedTranslationService: { getGlobalTranslations: getGlobalTranslationsMock },
  };
});

describe('sendinn-backend app', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDecoratorMock.mockResolvedValue({ DECORATOR_HEADER: '<header>decorator</header>' });
  });

  describe('index.html', () => {
    it('tells search engines not to index the page', async () => {
      const response = await request(createApp()).get('/sendinn/lospost').expect(200);

      expect(response.header['x-robots-tag']).toBe('noindex');
    });

    it.each([
      ['/sendinn/nav123456', 'nb'],
      ['/sendinn/nav123456?lang=en', 'en'],
      ['/sendinn/nav123456?lang=nn-NO', 'nn'],
      ['/sendinn/nav123456?lang=pl', 'nb'],
    ])('renders the decorator for %s in %s', async (url, language) => {
      await request(createApp()).get(url).expect(200);

      expect(getDecoratorMock).toHaveBeenCalledWith(expect.objectContaining({ language }));
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

    it('rejects unsupported languages with 400', async () => {
      await request(createApp()).get('/sendinn/api/global-translations/se').expect(400);
      expect(getGlobalTranslationsMock).not.toHaveBeenCalled();
    });

    it('accepts frontend log entries', async () => {
      await request(createApp()).post('/sendinn/api/log/info').send({ message: 'hello' }).expect(200);
    });

    // Runs last in this block: the log limiter belongs to the shared api router and keeps its count between tests
    it('rate limits frontend log entries', async () => {
      const app = createApp();
      const responses = await Promise.all(
        Array.from({ length: 61 }, () => request(app).post('/sendinn/api/log/info').send({ message: 'hello' })),
      );
      expect(responses.some((response) => response.status === 429)).toBe(true);
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
