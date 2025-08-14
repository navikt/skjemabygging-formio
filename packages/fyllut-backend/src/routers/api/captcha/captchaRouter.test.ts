import { Express } from 'express';
import request from 'supertest';
import { createApp } from '../../../app';

describe('Captcha Handler Tests', () => {
  let app: Express;
  let validCaptchaData: any;

  beforeEach(async () => {
    app = createApp();
    validCaptchaData = {
      firstName: '',
      data_33: 'ja',
    };
  });

  it('returns 200 with access_token if valid data is provided', async () => {
    await request(app)
      .post('/fyllut/api/captcha')
      .set('Origin', 'https://www.nav.no')
      .send(validCaptchaData)
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined();
      });
  });

  it('fails if challenge answer is incorrect', async () => {
    await request(app)
      .post('/fyllut/api/captcha')
      .set('Origin', 'https://www.nav.no')
      .send({
        ...validCaptchaData,
        data_33: 'Test', // Incorrect answer
      })
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('fails if body is empty', async () => {
    await request(app)
      .post('/fyllut/api/captcha')
      .set('Origin', 'https://www.nav.no')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('fails if firstName is present', async () => {
    await request(app)
      .post('/fyllut/api/captcha')
      .set('Origin', 'https://www.nav.no')
      .send({
        ...validCaptchaData,
        firstName: 'Roar',
      })
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('fails if data_33 is empty', async () => {
    const invalidData = { ...validCaptchaData };
    delete invalidData.data_33;
    await request(app)
      .post('/fyllut/api/captcha')
      .set('Origin', 'https://www.nav.no')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('returns 403 when origin is not allowed', async () => {
    await request(app)
      .post('/fyllut/api/captcha')
      .set('Origin', 'https://www.suspicious-site.com')
      .send(validCaptchaData)
      .expect(403);
  });
});
