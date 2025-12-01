import { guid } from '@navikt/skjemadigitalisering-shared-domain';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import jose from 'node-jose';
import qs from 'qs';
import { config } from '../config/config';
import { logger } from '../logger.js';
import { toJsonOrThrowError } from '../utils/errorHandling';

const grant_type = 'urn:ietf:params:oauth:grant-type:token-exchange';
const client_assertion_type = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';
const subject_token_type = 'urn:ietf:params:oauth:token-type:jwt';

const { tokenx: tokenxConfig } = config;

class TokenXClient {
  static instance = new TokenXClient();

  tokenEndpoint = null;

  exchangeToken = async (idportenToken, targetClientId) => {
    const tokenEndpoint = await this.getTokenEndpoint();
    logger.debug(`Exchanging token (audience ${targetClientId})`);
    const clientAssertion = await this.createClientAssertion(tokenEndpoint);
    const body = {
      grant_type,
      client_assertion_type,
      client_assertion: clientAssertion,
      subject_token_type,
      subject_token: idportenToken,
      audience: targetClientId,
    };

    const response = await fetch(tokenEndpoint, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      body: qs.stringify(body),
    });
    const { access_token } = await toJsonOrThrowError('Failed to exchange token')(response);
    logger.debug('Token exchange completed');
    return access_token;
  };

  createClientAssertion = async (tokenEndpoint) => {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: tokenxConfig.fyllutClientId,
      iss: tokenxConfig.fyllutClientId,
      aud: tokenEndpoint,
      jti: guid(),
      nbf: now,
      iat: now,
      exp: now + 60, // max 120
    };
    const key = await this.asKey(tokenxConfig.privateJwk);
    const options = {
      algorithm: 'RS256',
      header: {
        kid: key.kid,
        typ: 'JWT',
        alg: 'RS256',
      },
    };
    return jwt.sign(payload, key.toPEM(true), options);
  };

  asKey = async (jwk) => {
    if (!jwk) throw Error('JWK missing');
    return jose.JWK.asKey(jwk).then((key) => {
      return Promise.resolve(key);
    });
  };

  getTokenEndpoint = async () => {
    if (this.tokenEndpoint) {
      return Promise.resolve(this.tokenEndpoint);
    }
    return this.init();
  };

  init = async () => {
    logger.info('Initializing TokenX client');
    return fetch(tokenxConfig.wellKnownUrl, { method: 'GET' })
      .then(toJsonOrThrowError('Failed to initialize TokenX client'))
      .then(({ token_endpoint }) => {
        logger.info('TokenX client ready', { token_endpoint });
        this.tokenEndpoint = token_endpoint;
        return token_endpoint;
      })
      .catch((error) => {
        logger.error('Failed to initialize TokenX client', { error });
        throw error;
      });
  };
}

export default TokenXClient;
