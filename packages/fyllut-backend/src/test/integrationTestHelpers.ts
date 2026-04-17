import jwt from 'jsonwebtoken';
import nock from 'nock';
import { expect } from 'vitest';
import { config } from '../config/config';
import { createMockIdportenJwt, extractHost, extractPath, generateJwk } from './testHelpers';

type SetupTokenMocksOptions = {
  pid?: string;
  tokenxAccessToken?: string;
  azureAccessToken?: string;
  tokenxEndpoint?: string;
};

type SetupAzureTokenMocksOptions = {
  azureAccessToken?: string;
  count?: number;
};

const setupAzureTokenMocks = ({
  azureAccessToken = 'azure-access-token',
  count = 1,
}: SetupAzureTokenMocksOptions = {}) => {
  const scopes = Array.from({ length: count }, () =>
    nock(extractHost(process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT!))
      .post(extractPath(process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT!))
      .reply(200, { access_token: azureAccessToken }),
  );

  return {
    azureAccessToken,
    assertDone: () => {
      scopes.forEach((scope) => expect(scope.isDone()).toBe(true));
    },
  };
};

const setupTokenMocks = async ({
  pid = '12345678911',
  tokenxAccessToken = 'tokenx-access-token-for-unittest',
  azureAccessToken = 'azure-access-token',
  tokenxEndpoint = 'http://tokenx-unittest.nav.no/token',
}: SetupTokenMocksOptions = {}) => {
  const key = await generateJwk();
  const azureTokenSetup = setupAzureTokenMocks({ azureAccessToken });
  const scopes = [
    nock(extractHost(config.idporten!.idportenJwksUri))
      .get(extractPath(config.idporten!.idportenJwksUri))
      .reply(200, { keys: [key.toJSON(false)] }),
    nock(extractHost(config.tokenx!.wellKnownUrl))
      .get(extractPath(config.tokenx!.wellKnownUrl))
      .reply(200, { token_endpoint: tokenxEndpoint }),
    nock(extractHost(tokenxEndpoint))
      .post(extractPath(tokenxEndpoint))
      .reply(200, { access_token: tokenxAccessToken }, { 'Content-Type': 'application/json' }),
  ];

  return {
    authorizationHeader: `Bearer ${createMockIdportenJwt({ pid }, undefined, key)}`,
    pid,
    tokenxAccessToken,
    azureAccessToken,
    assertDone: () => {
      scopes.forEach((scope) => expect(scope.isDone()).toBe(true));
      azureTokenSetup.assertDone();
    },
  };
};

const createNologinToken = (innsendingsId: string, expiresIn: `${number}${'ms' | 's' | 'm' | 'h'}` | number = '1h') =>
  jwt.sign({ purpose: 'nologin', innsendingsId }, config.nologin.jwtSecret, { expiresIn });

export { createNologinToken, setupAzureTokenMocks, setupTokenMocks };
