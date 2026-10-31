import { mockFetch } from '@navikt/skjemadigitalisering-shared-backend/test';
import jwt from 'jsonwebtoken';
import { expect } from 'vitest';
import { config } from '../config/config';
import { extractHost, extractPath } from './testHelpers';

type SetupAzureTokenMocksOptions = {
  azureAccessToken?: string;
  count?: number;
};

const setupAzureTokenMocks = ({
  azureAccessToken = 'azure-access-token',
  count = 1,
}: SetupAzureTokenMocksOptions = {}) => {
  const scopes = Array.from({ length: count }, () =>
    mockFetch(extractHost(process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT!))
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

const createNologinToken = (innsendingsId: string, expiresIn: `${number}${'ms' | 's' | 'm' | 'h'}` | number = '1h') =>
  jwt.sign({ purpose: 'nologin', innsendingsId }, config.nologin.jwtSecret, { expiresIn });

export { createNologinToken, setupAzureTokenMocks };
