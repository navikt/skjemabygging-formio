import nock from 'nock';
import { config } from '../config/config';
import { extractHost, extractPath } from '../test/testHelpers';
import TokenXClient from './tokenxClient.js';

const { tokenx: tokenxConfig } = config;

const token_endpoint = `${extractHost(tokenxConfig.wellKnownUrl)}/token`;
const mockTokenxAccessToken = '123456';

describe('TokenX client', () => {
  const { instance: client } = TokenXClient;

  let recorder;

  beforeEach(() => {
    recorder = new Recorder();
    nockWellKnown();
  });

  const nockWellKnown = () => {
    nock(extractHost(tokenxConfig.wellKnownUrl))
      .get(extractPath(tokenxConfig.wellKnownUrl))
      .reply(200, { token_endpoint });
  };

  it('exchanges idporten jwt for a TokenX access token', async () => {
    const tokenxNockScope = nock(extractHost(token_endpoint))
      .post(extractPath(token_endpoint), recorder.saveBody)
      .reply(200, { access_token: mockTokenxAccessToken }, { 'Content-Type': 'application/json' });
    // eslint-disable-next-line no-useless-catch
    try {
      const accessToken = await client.exchangeToken('idporten-jwt', 'unittest-gcp:namespace:app-a');
      expect(accessToken).toEqual(mockTokenxAccessToken);
    } catch (err) {
      throw err;
    }
    tokenxNockScope.done();
    expect(recorder.bodies).toHaveLength(1);
    expect(recorder.bodies[0].subject_token).toBe('idporten-jwt');
    expect(recorder.bodies[0].audience).toBe('unittest-gcp:namespace:app-a');
  });

  it('throws error when response from TokenX is not ok', async () => {
    const tokenxNockScope = nock(extractHost(token_endpoint))
      .post(extractPath(token_endpoint), recorder.saveBody)
      .reply(500, { message: 'Error occurred' }, { 'Content-Type': 'application/json' });

    await expect(client.exchangeToken('idporten-jwt', 'unittest-gcp:namespace:app-a')).rejects.toMatchObject({
      message: 'Failed to exchange token',
      http_response_body: { message: 'Error occurred' },
    });

    tokenxNockScope.done();
    expect(recorder.bodies).toHaveLength(1);
    expect(recorder.bodies[0].subject_token).toBe('idporten-jwt');
    expect(recorder.bodies[0].audience).toBe('unittest-gcp:namespace:app-a');
  });

  class Recorder {
    bodies = [];
    saveBody = (body) => {
      this.bodies.push(body);
      return body;
    };
  }
});
