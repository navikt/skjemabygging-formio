import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import jose from 'node-jose';
import { Mock } from 'vitest';

const keystore = jose.JWK.createKeyStore();

const getPosition = (string, subString, index) => {
  return string.split(subString, index).join(subString).length;
};

const extractHost = (url: string): string => {
  // Returns substring before third occurrence of slash
  return url.substring(0, getPosition(url, '/', 3));
};
const extractPath = (url: string): string => {
  // Returns substring after and including third occurrence of slash
  return url.substring(getPosition(url, '/', 3));
};

interface MockedResponse extends Response {
  json: Mock;
  send: Mock;
  contentType: Mock;
  status: Mock;
  sendStatus: Mock;
  header: Mock;
}

function mockResponse(): MockedResponse {
  return {
    json: vi.fn(),
    send: vi.fn(),
    contentType: vi.fn(),
    status: vi.fn(),
    sendStatus: vi.fn(),
    header: vi.fn(),
  } as unknown as MockedResponse;
}

type MockRequestParams = {
  headers?: { [name: string]: string };
  body?: object;
  params?: { [name: string]: string };
  query?: { [name: string]: string };
  getMap?: Record<string, string | undefined>;
};

type ExpiresIn = `${number}${'ms' | 's' | 'm' | 'h'}` | number;

function mockRequest({ headers = {}, body, params = {}, query = {}, getMap = {} }: MockRequestParams): Request {
  return {
    header: (name: string) => headers?.[name],
    headers: { ...headers },
    body,
    params: { ...params },
    query: { ...query },
    get: (name: string) => getMap[name] ?? '',
  } as unknown as Request;
}

const generateJwk = async () => keystore.generate('RSA', 2048);

const createMockIdportenJwt = (payload: object, expiresIn: ExpiresIn = '5m', key: jose.JWK.Key) => {
  const { IDPORTEN_CLIENT_ID, IDPORTEN_ISSUER } = process.env;
  const obj = {
    token_type: 'Bearer',
    client_id: IDPORTEN_CLIENT_ID,
    iss: IDPORTEN_ISSUER,
    acr: 'Level4',
    pid: '12345678911',
    ...payload,
  };
  return createAccessToken(obj, expiresIn, key);
};

const createAccessToken = (payload: string | Buffer | object, expiresIn: ExpiresIn, key: jose.JWK.Key) => {
  return jwt.sign(payload, key.toPEM(true), { expiresIn, algorithm: 'RS256' });
};

export { createAccessToken, createMockIdportenJwt, extractHost, extractPath, generateJwk, mockRequest, mockResponse };
export type { MockRequestParams };
