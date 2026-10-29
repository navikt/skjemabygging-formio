import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import request from 'supertest';
import { createApp } from './app';

const { getDecoratorMock, getGlobalTranslationsMock, getFormMock } = vi.hoisted(() => ({
  getDecoratorMock: vi.fn(),
  getGlobalTranslationsMock: vi.fn(),
  getFormMock: vi.fn(),
}));

vi.mock('./services', async () => {
  const { Registry } = await import('prom-client');
  return {
    decorator: { getDecorator: getDecoratorMock },
    idportenAuth: { authenticate: vi.fn() },
    metricsRegister: new Registry(),
    contentService: { getGlobalTranslations: getGlobalTranslationsMock },
    sendinnFormService: { getForm: getFormMock },
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

    it('serves translations from the configured content service', async () => {
      getGlobalTranslationsMock.mockResolvedValue({ Yes: { en: 'Yes' } });

      const response = await request(createApp()).get('/sendinn/api/global-translations/en').expect(200);

      expect(response.body).toEqual({ Yes: { en: 'Yes' } });
      expect(getGlobalTranslationsMock).toHaveBeenCalledWith('en');
    });

    it('returns a correlated standard error when content loading fails', async () => {
      getGlobalTranslationsMock.mockRejectedValue(
        new ResponseError('SERVICE_UNAVAILABLE', 'Unable to load forms-api content'),
      );

      const response = await request(createApp()).get('/sendinn/api/global-translations/en').expect(503);

      expect(response.body).toMatchObject({
        errorCode: 'SERVICE_UNAVAILABLE',
        message: 'Unable to load forms-api content',
        correlationId: expect.any(String),
      });
      expect(response.header['x-correlation-id']).toBe(response.body.correlationId);
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

  describe('form loading boundary', () => {
    it('passes only the path, language and normalized repeated/comma-separated filter to the service, ignoring sub', async () => {
      getFormMock.mockResolvedValue({ form: { path: 'nav123456' } });
      const response = await request(createApp())
        .get('/sendinn/api/forms/nav123456?lang=en&filter=%20N2,N1%20&filter=,%20N3&sub=digital')
        .expect(200);

      expect(getFormMock).toHaveBeenCalledWith({
        formPath: 'nav123456',
        language: 'en',
        attachmentFilter: ['N2', 'N1', 'N3'],
      });
      expect(response.body).toEqual({ form: { path: 'nav123456' } });
      expect(response.header['cache-control']).toBe('no-store');
    });

    it.each(['', '?filter=%20,%20', '?sub=paper', '?sub=digital', '?sub=anything'])(
      'defaults to Bokmål and all attachments for %s',
      async (query) => {
        getFormMock.mockResolvedValue({});
        await request(createApp()).get(`/sendinn/api/forms/nav123456${query}`).expect(200);
        expect(getFormMock).toHaveBeenCalledWith({
          formPath: 'nav123456',
          language: 'nb',
          attachmentFilter: [],
        });
      },
    );

    it.each(['INVALID', 'nav-123456', 'nav123456?lang=se', 'nav123456?lang=en&lang=nn'])(
      'rejects malformed path/language %s before loading content',
      async (path) => {
        const response = await request(createApp()).get(`/sendinn/api/forms/${path}`).expect(400);
        expect(response.body).toMatchObject({ errorCode: 'BAD_REQUEST', correlationId: expect.any(String) });
        expect(getFormMock).not.toHaveBeenCalled();
      },
    );

    it.each([
      ['NOT_FOUND', 404],
      ['SERVICE_UNAVAILABLE', 503],
    ] as const)('returns the standard correlated %s error', async (errorCode, status) => {
      getFormMock.mockRejectedValue(new ResponseError(errorCode, 'Unable to load forms-api content', 'upstream-id'));
      const response = await request(createApp()).get('/sendinn/api/forms/nav123456').expect(status);
      expect(response.body).toMatchObject({
        errorCode,
        message: 'Unable to load forms-api content',
        correlationId: 'upstream-id',
      });
      expect(response.header['x-correlation-id']).toBe('upstream-id');
    });
  });
});
