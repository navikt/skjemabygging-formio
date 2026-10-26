import nock from 'nock';
import request from 'supertest';
import { createApp } from './app';
import { config } from './config/config';
import TokenXClient from './security/tokenxClient';
import { createMockIdportenJwt, extractHost, extractPath, generateJwk } from './test/testHelpers';

vi.mock('./dekorator', () => ({
  getDecorator: () => {},
  createRedirectUrl: () => '',
}));

afterEach(() => {
  vi.restoreAllMocks();
  nock.cleanAll();
});

it('rejects a JWT without a key ID when multiple ID-porten keys match', async () => {
  const key = await generateJwk();
  const secondKey = await generateJwk();
  const jwksScope = nock(extractHost(config.idporten!.idportenJwksUri))
    .get(extractPath(config.idporten!.idportenJwksUri))
    .reply(200, { keys: [key.toJSON(false), secondKey.toJSON(false)] });
  const exchangeToken = vi.spyOn(TokenXClient.instance, 'exchangeToken');

  await request(createApp())
    .get(
      '/fyllut/api/send-inn/digital-application/65ed0008-ec72-4c90-8b44-165d3c265da0/attachments/attachment01/12345678-1234-1234-1234-123456789abc',
    )
    .set('Authorization', `Bearer ${createMockIdportenJwt({}, '1h', key)}`)
    .expect(401);

  jwksScope.done();
  expect(exchangeToken).not.toHaveBeenCalled();
});
