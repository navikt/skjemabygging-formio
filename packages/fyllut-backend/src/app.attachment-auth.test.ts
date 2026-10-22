import jwt from 'jsonwebtoken';
import nock from 'nock';
import jose from 'node-jose';
import request from 'supertest';
import { createApp } from './app';
import { config } from './config/config';
import TokenXClient from './security/tokenxClient';
import { createNologinToken, setupAzureTokenMocks } from './test/integrationTestHelpers';
import { createMockIdportenJwt, extractHost, extractPath, generateJwk } from './test/testHelpers';

vi.mock('./dekorator', () => ({
  getDecorator: () => {},
  createRedirectUrl: () => '',
}));

const innsendingsId = '65ed0008-ec72-4c90-8b44-165d3c265da0';
const attachmentId = 'attachment01';
const fileId = '12345678-1234-1234-1234-123456789abc';
const digitalPath = `/fyllut/api/send-inn/digital-application/${innsendingsId}/attachments/${attachmentId}`;

describe('Fyllut attachment authentication', () => {
  let key: jose.JWK.Key;

  beforeAll(async () => {
    key = await generateJwk();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    nock.cleanAll();
  });

  it.each([
    ['GET', `${digitalPath}/${fileId}`],
    ['POST', digitalPath],
    ['DELETE', digitalPath],
    ['DELETE', `${digitalPath}/${fileId}`],
  ])('returns 401 for %s without authentication or a submission-method header', async (method, path) => {
    const exchangeToken = vi.spyOn(TokenXClient.instance, 'exchangeToken');
    const response = await request(createApp())[method.toLowerCase() as 'get' | 'post' | 'delete'](path).expect(401);

    expect(response.body).toMatchObject({
      errorCode: 'UNAUTHORIZED',
      message: 'ID-porten authentication is required',
      correlationId: expect.any(String),
    });
    expect(response.headers['x-correlation-id']).toBe(response.body.correlationId);
    expect(exchangeToken).not.toHaveBeenCalled();
  });

  it.each([
    ['GET', `${digitalPath}/${fileId}`],
    ['POST', digitalPath],
    ['DELETE', digitalPath],
  ])('returns 401 for %s with an invalid ID-porten token and no submission-method header', async (method, path) => {
    const exchangeToken = vi.spyOn(TokenXClient.instance, 'exchangeToken');
    const client = request(createApp());
    await client[method.toLowerCase() as 'get' | 'post' | 'delete'](path)
      .set('Authorization', 'Bearer invalid-jwt')
      .expect(401);

    expect(exchangeToken).not.toHaveBeenCalled();
  });

  it('returns 401 for a JWT with an unrecognized critical header', async () => {
    const header = { alg: 'RS256', crit: ['unknown'], unknown: true };
    const token = jwt.sign(
      {
        client_id: config.idporten!.idportenClientId,
        iss: config.idporten!.idportenIssuer,
        acr: 'Level4',
        pid: '12345678911',
      },
      key.toPEM(true),
      { algorithm: 'RS256', expiresIn: '1h', header },
    );
    const exchangeToken = vi.spyOn(TokenXClient.instance, 'exchangeToken');

    await request(createApp()).get(`${digitalPath}/${fileId}`).set('Authorization', `Bearer ${token}`).expect(401);

    expect(exchangeToken).not.toHaveBeenCalled();
  });

  it('does not disguise an ID-porten key-service outage as invalid authentication', async () => {
    const jwksScope = nock(extractHost(config.idporten!.idportenJwksUri))
      .get(extractPath(config.idporten!.idportenJwksUri))
      .reply(503);
    const exchangeToken = vi.spyOn(TokenXClient.instance, 'exchangeToken');

    const response = await request(createApp())
      .get(`${digitalPath}/${fileId}`)
      .set('Authorization', `Bearer ${createMockIdportenJwt({}, '1h', key)}`)
      .expect(500);

    expect(response.body.errorCode).toBe('INTERNAL_SERVER_ERROR');
    expect(exchangeToken).not.toHaveBeenCalled();
    jwksScope.done();
  });

  it('accepts an authenticated digital attachment request without a submission-method header', async () => {
    const jwksScope = nock(extractHost(config.idporten!.idportenJwksUri))
      .get(extractPath(config.idporten!.idportenJwksUri))
      .reply(200, { keys: [key.toJSON(false)] });
    const exchangeToken = vi.spyOn(TokenXClient.instance, 'exchangeToken').mockResolvedValue('tokenx-access-token');
    const upstreamScope = nock(config.sendInnConfig.host)
      .delete(`/v1/application-digital/${innsendingsId}/attachments/${attachmentId}`)
      .matchHeader('authorization', 'Bearer tokenx-access-token')
      .reply(204);

    await request(createApp())
      .delete(digitalPath)
      .set('Authorization', `Bearer ${createMockIdportenJwt({}, '1h', key)}`)
      .expect(204);

    expect(exchangeToken).toHaveBeenCalledOnce();
    jwksScope.done();
    upstreamScope.done();
  });

  it('still allows nologin attachments without an ID-porten JWT', async () => {
    const azureToken = setupAzureTokenMocks();
    const exchangeToken = vi.spyOn(TokenXClient.instance, 'exchangeToken');
    const upstreamScope = nock(config.sendInnConfig.host)
      .delete(`/v1/application-nologin/${innsendingsId}/attachments/${attachmentId}`)
      .reply(204);

    await request(createApp())
      .delete(`/fyllut/api/send-inn/nologin-application/attachments/${attachmentId}`)
      .set('NologinToken', createNologinToken(innsendingsId))
      .expect(204);

    expect(exchangeToken).not.toHaveBeenCalled();
    azureToken.assertDone();
    upstreamScope.done();
  });

  it('rejects other TokenX-dependent routes without an ID-porten JWT', async () => {
    await request(createApp()).get('/fyllut/api/register-data/activities').expect(401);
  });
});
