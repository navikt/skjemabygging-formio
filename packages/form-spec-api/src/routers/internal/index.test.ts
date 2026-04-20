import request from 'supertest';
import { createApp } from '../../app';

describe('internalRouter', () => {
  it('returns 200 for isAlive', async () => {
    await request(createApp()).get('/internal/isAlive').expect(200);
  });

  it('returns 200 for isReady', async () => {
    await request(createApp()).get('/internal/isReady').expect(200);
  });
});
