import request from 'supertest';
import { createApp } from './app';

vi.mock('./logger.js');
vi.mock('./dekorator.js', () => ({
  getDecorator: () => {},
  createRedirectUrl: () => '',
}));

const IP_LOCALHOST = '127.0.0.1';
const IP_EXTERNAL = '192.168.2.1';
const IP_NAV = '10.255.255.255';

describe('Setup dev server', () => {
  describe('Dev setup is enabled', () => {
    const SETUP_DEV = true;

    describe('Request', () => {
      const requests = [
        { path: '/fyllut/', ip: IP_EXTERNAL, cookies: [], expectedHttpStatus: 401 },
        { path: '/fyllut/', ip: IP_NAV, cookies: [], expectedHttpStatus: 200 },
        { path: '/fyllut/', ip: IP_EXTERNAL, cookies: ['fyllut-dev-access=true'], expectedHttpStatus: 200 },
        { path: '/fyllut/', ip: IP_LOCALHOST, cookies: [], expectedHttpStatus: 200 },
        { path: '/fyllut/internal/metrics', ip: IP_NAV, cookies: [], expectedHttpStatus: 200 },
        { path: '/fyllut/internal/isalive', ip: IP_NAV, cookies: [], expectedHttpStatus: 200 },
        { path: '/fyllut/internal/isready', ip: IP_NAV, cookies: [], expectedHttpStatus: 200 },
      ];

      it.each(requests)('%j', async ({ path, ip, cookies, expectedHttpStatus }) => {
        await request(createApp(SETUP_DEV))
          .get(path)
          .set('X-Forwarded-For', ip)
          .set('Cookie', cookies)
          .expect(expectedHttpStatus);
      });
    });

    describe('Request to /fyllut/test/login', () => {
      it('renders dev-access html', async () => {
        const res = await request(createApp(SETUP_DEV))
          .get('/fyllut/test/login')
          .set('X-Forwarded-For', IP_EXTERNAL)
          .expect(200);
        expect(res.headers['content-type']).toContain('text/html');
        expect(res.text).toContain('Du har nå tilgang');
        expect(res.headers['set-cookie'][0]).toContain('fyllut-dev-access=true');
      });

      it('redirects to form if query param formPath exists when external ip', async () => {
        const res = await request(createApp(SETUP_DEV))
          .get('/fyllut/test/login?formPath=nav123456')
          .set('X-Forwarded-For', IP_EXTERNAL)
          .expect(302);
        expect(res.headers['location']).toContain('/fyllut/nav123456');
        expect(res.headers['set-cookie'][0]).toContain('fyllut-dev-access=true');
      });

      it('redirects to form and keeps sub query param', async () => {
        const res = await request(createApp(SETUP_DEV))
          .get('/fyllut/test/login?formPath=nav123456&sub=digital')
          .set('X-Forwarded-For', IP_EXTERNAL)
          .expect(302);
        expect(res.headers['location']).toContain('/fyllut/nav123456');
        expect(res.headers['set-cookie'][0]).toContain('fyllut-dev-access=true');
      });

      it('redirects to form if query param formPath exists when Nav ip', async () => {
        const res = await request(createApp(SETUP_DEV))
          .get('/fyllut/test/login?formPath=nav123456')
          .set('X-Forwarded-For', IP_NAV)
          .expect(302);
        expect(res.headers['location']).toContain('/fyllut/nav123456');
        expect(res.headers['set-cookie'][0]).toContain('fyllut-dev-access=true');
      });

      it('returns 400 bad request when formPath contains irregular characters', async () => {
        const res = await request(createApp(SETUP_DEV))
          .get('/fyllut/test/login?formPath=suspekt$%skjema%')
          .set('X-Forwarded-For', IP_EXTERNAL)
          .expect(400);
        expect(res.headers['set-cookie']).toBeUndefined();
      });

      it('redirects to form even if formPath is not a valid form number', async () => {
        const res = await request(createApp(SETUP_DEV))
          .get('/fyllut/test/login?formPath=testskjema001')
          .set('X-Forwarded-For', IP_EXTERNAL)
          .expect(302);
        expect(res.headers['location']).toContain('/fyllut/testskjema001');
        expect(res.headers['set-cookie'][0]).toContain('fyllut-dev-access=true');
      });
    });
  });
});
