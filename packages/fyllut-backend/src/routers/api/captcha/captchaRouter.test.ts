import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import request from 'supertest';
import { createApp } from '../../../app';

describe('Captcha Handler Tests', () => {
  let now: string = '';
  let validCaptchaData: any;

  beforeEach(() => {
    now = dateUtils.getIso8601String();
    vi.spyOn(dateUtils, 'getIso8601String').mockReturnValue(now);
    validCaptchaData = {
      data_33: 'ja',
      firstName: '',
      timestampRender: dateUtils.add('seconds', -4, now),
      timestampSubmit: dateUtils.add('seconds', -1, now),
    };
  });

  it('returns 200 with access_token if valid data is provided', async () => {
    await request(createApp())
      .post('/fyllut/api/captcha')
      .send(validCaptchaData)
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined();
      });
  });

  it('fails if body is empty', async () => {
    await request(createApp()).post('/fyllut/api/captcha').send({}).expect('Content-Type', /json/).expect(400);
  });

  it('fails if firstName is present', async () => {
    await request(createApp())
      .post('/fyllut/api/captcha')
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
    await request(createApp()).post('/fyllut/api/captcha').send({}).expect('Content-Type', /json/).expect(400);
  });

  it('fails if submitted too close to render timestamp', async () => {
    const timestampRender = dateUtils.add('minutes', -1, now)!;
    const timestampSubmit = dateUtils.add('seconds', 2.9, timestampRender)!;
    await request(createApp())
      .post('/fyllut/api/captcha')
      .send({
        ...validCaptchaData,
        timestampRender,
        timestampSubmit,
      })
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('fails if timestampRender is after timestampSubmit', async () => {
    const timestampRender = dateUtils.add('minutes', -1, now)!;
    const timestampSubmit = dateUtils.add('seconds', -10, timestampRender)!;
    await request(createApp())
      .post('/fyllut/api/captcha')
      .send({
        ...validCaptchaData,
        timestampRender,
        timestampSubmit,
      })
      .expect(400);
  });

  it('fails if timestamps in body are suspiciously old', async () => {
    const timestampRender = dateUtils.add('minutes', -7, now)!;
    const timestampSubmit = dateUtils.add('seconds', 10, timestampRender)!;
    await request(createApp())
      .post('/fyllut/api/captcha')
      .send({
        ...validCaptchaData,
        timestampRender,
        timestampSubmit,
      })
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('fails if submit timestamp in body is in the future', async () => {
    const timestampRender = dateUtils.add('minutes', -1, now)!;
    const timestampSubmit = dateUtils.add('seconds', 10, now)!;
    await request(createApp())
      .post('/fyllut/api/captcha')
      .send({
        ...validCaptchaData,
        timestampRender,
        timestampSubmit,
      })
      .expect('Content-Type', /json/)
      .expect(400);
  });
});
