// @vitest-environment jsdom

import { ResponseError, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import http from './http';

interface TestBody {
  body: string;
}
const defaultBodyText = 'This is the body';

const statusTexts: Record<number, string> = { 200: 'OK', 201: 'Created', 404: 'Not Found', 503: 'Service Unavailable' };

const mockFetchResponse = (status: number, body?: unknown, headers: Record<string, string> = {}) => {
  const responseBody = body === undefined || typeof body === 'string' ? body : JSON.stringify(body);
  return vi
    .spyOn(global, 'fetch')
    .mockResolvedValue(new Response(responseBody, { status, statusText: statusTexts[status], headers }));
};

const setupDefaultGetMock = () =>
  mockFetchResponse(200, { body: defaultBodyText }, { 'Content-Type': http.MimeType.JSON });

const originalWindowLocation = window.location;

describe('http requests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('get', () => {
    it('with custom headers', async () => {
      const fetchSpy = setupDefaultGetMock();
      const headers = {
        'Content-Type': http.MimeType.TEXT,
      };

      const response = await http.get<TestBody>('https://www.nav.no/ok', headers);
      expect(typeof response).toBe('object');
      expect(response.body).toBe(defaultBodyText);
      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it('without custom headers', async () => {
      const fetchSpy = setupDefaultGetMock();
      const response = await http.get<TestBody>('https://www.nav.no/ok');
      expect(response.body).toBe(defaultBodyText);
      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it('with text response', async () => {
      const fetchSpy = mockFetchResponse(
        200,
        {
          body: 'This is the body',
        },
        { 'Content-Type': http.MimeType.TEXT },
      );

      const response = await http.get('https://www.nav.no/ok');
      expect(typeof response).toBe('string');
      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it('error with json', async () => {
      const errorMessage = 'Error message';
      const fetchSpy = mockFetchResponse(404, { message: errorMessage }, { 'Content-Type': http.MimeType.JSON });

      await expect(http.get('https://www.nav.no/error')).rejects.toThrow(errorMessage);

      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it('throws ResponseError and keeps userMessage separate from message', async () => {
      const fetchSpy = mockFetchResponse(
        503,
        {
          message: 'Internal upstream detail',
          userMessage: 'statiske.nologin.temporarilyUnavailable',
          errorCode: 'SERVICE_UNAVAILABLE',
          correlationId: 'corr-id',
        },
        { 'Content-Type': http.MimeType.JSON },
      );

      await expect(http.get('https://www.nav.no/response-error')).rejects.toMatchObject({
        constructor: ResponseError,
        message: 'Internal upstream detail',
        userMessage: 'statiske.nologin.temporarilyUnavailable',
        errorCode: 'SERVICE_UNAVAILABLE',
        correlationId: 'corr-id',
      });

      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it('error', async () => {
      const errorMessage = 'Error message';
      const fetchSpy = mockFetchResponse(404, errorMessage, { 'Content-Type': http.MimeType.TEXT });

      await expect(http.get('https://www.nav.no/error')).rejects.toThrow(errorMessage);

      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it('error with unsupported mimetype', async () => {
      // Should use default statusText as message
      const fetchSpy = mockFetchResponse(404, undefined, { 'Content-Type': 'whatever' });

      await expect(http.get('https://www.nav.no/error')).rejects.toThrow('Not Found');

      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it('defaults userMessage when backend response does not provide one', async () => {
      const fetchSpy = mockFetchResponse(503, 'Service unavailable', { 'Content-Type': http.MimeType.TEXT });

      await expect(http.get('https://www.nav.no/response-error-without-user-message')).rejects.toMatchObject({
        constructor: ResponseError,
        message: 'Service unavailable',
        userMessage: TEXTS.statiske.error.serverErrorTitle,
        errorCode: 'SERVICE_UNAVAILABLE',
      });

      expect(fetchSpy).toHaveBeenCalledOnce();
    });
  });

  describe('opts', () => {
    describe('redirectToLocation', () => {
      let windowLocation;

      beforeEach(() => {
        windowLocation = { href: '', assign: vi.fn() };
        Object.defineProperty(window, 'location', {
          value: windowLocation,
          writable: true,
        });
        mockFetchResponse(201, 'CREATED', {
          'Content-Type': http.MimeType.TEXT,
          Location: 'https://www.nav.no/sendInn/123',
        });
      });

      afterEach(() => {
        // @ts-expect-error Possible bug in typescript: https://github.com/microsoft/TypeScript/issues/61335
        window.location = originalWindowLocation;
      });

      it('redirects to location', async () => {
        const response = await http.post(
          'https://www.unittest.nav.no/fyllut/api/send-inn',
          {},
          {},
          { redirectToLocation: true },
        );
        expect(windowLocation.href).toBe('https://www.nav.no/sendInn/123');
        expect(response).toBe('CREATED');
      });

      it('does not redirect to location', async () => {
        const response = await http.post('https://www.unittest.nav.no/fyllut/api/send-inn', {}, {});
        expect(windowLocation.href).toBe('');
        expect(response).toBe('CREATED');
      });
    });
  });
});
