import nock from 'nock';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import { config } from './config/config';
import { createNologinToken, setupAzureTokenMocks } from './test/integrationTestHelpers';

vi.mock('./dekorator', () => ({
  getDecorator: () => {},
  createRedirectUrl: () => '',
}));

describe('Fyllut backend :: delete nologin application', () => {
  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  it('deletes the application through the innsending-api nologin application endpoint', async () => {
    const innsendingsId = '21ed0008-ec72-4c90-8b44-165d3c265da9';
    const tokenSetup = setupAzureTokenMocks();
    const sendInnScope = nock(config.sendInnConfig.host)
      .delete(`/v1/application-nologin/${innsendingsId}`)
      .matchHeader('authorization', `Bearer ${tokenSetup.azureAccessToken}`)
      .matchHeader('x-innsendingsid', innsendingsId)
      .reply(204);

    const response = await request(createApp())
      .delete('/fyllut/api/send-inn/nologin-application')
      .set({ NologinToken: createNologinToken(innsendingsId) });

    expect(response.status).toBe(204);
    tokenSetup.assertDone();
    sendInnScope.done();
  });
});
