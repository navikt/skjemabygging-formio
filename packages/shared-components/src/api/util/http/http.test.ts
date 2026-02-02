import nock from 'nock';
import http from './http';

interface TestBody {
  body: string;
}
const defaultBodyText = 'This is the body';
const setupDefaultGetMock = () => {
  nock('https://www.nav.no')
    .defaultReplyHeaders({
      'Content-Type': http.MimeType.JSON,
    })
    .get('/ok')
    .reply(200, {
      body: defaultBodyText,
    });
};

const originalWindowLocation = window.location;

describe('http requests', () => {
  describe('get', () => {
    it('with custom headers', async () => {
      setupDefaultGetMock();
      const headers = {
        'Content-Type': http.MimeType.TEXT,
      };

      const response = await http.get<TestBody>('https://www.nav.no/ok', headers);
      expect(typeof response).toBe('object');
      expect(response.body).toBe(defaultBodyText);
      nock.isDone();
    });

    it('without custom headers', async () => {
      setupDefaultGetMock();
      const response = await http.get<TestBody>('https://www.nav.no/ok');
      expect(response.body).toBe(defaultBodyText);
      nock.isDone();
    });

    it('with text response', async () => {
      nock('https://www.nav.no')
        .defaultReplyHeaders({
          'Content-Type': http.MimeType.TEXT,
        })
        .get('/ok')
        .reply(200, {
          body: 'This is the body',
        });

      const response = await http.get('https://www.nav.no/ok');
      expect(typeof response).toBe('string');
      nock.isDone();
    });

    it('error with json', async () => {
      const errorMessage = 'Error message';
      nock('https://www.nav.no')
        .defaultReplyHeaders({
          'Content-Type': http.MimeType.JSON,
        })
        .get('/error')
        .reply(404, { message: errorMessage });

      await expect(http.get('https://www.nav.no/error')).rejects.toThrow(errorMessage);

      nock.isDone();
    });

    it('error', async () => {
      const errorMessage = 'Error message';
      nock('https://www.nav.no')
        .defaultReplyHeaders({
          'Content-Type': http.MimeType.TEXT,
        })
        .get('/error')
        .reply(404, errorMessage);

      await expect(http.get('https://www.nav.no/error')).rejects.toThrow(errorMessage);

      nock.isDone();
    });

    it('error with unsupported mimetype', async () => {
      // Should use default statusText as message
      nock('https://www.nav.no')
        .defaultReplyHeaders({
          'Content-Type': 'whatever',
        })
        .get('/error')
        .reply(404);

      await expect(http.get('https://www.nav.no/error')).rejects.toThrow('Not Found');

      nock.isDone();
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
        nock('https://www.unittest.nav.no').post('/fyllut/api/send-inn').reply(201, 'CREATED', {
          'Content-Type': http.MimeType.TEXT,
          Location: 'https://www.nav.no/sendInn/123',
        });
      });

      afterEach(() => {
        nock.isDone();
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
