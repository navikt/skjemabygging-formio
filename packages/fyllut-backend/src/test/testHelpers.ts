import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import jose from 'node-jose';

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

function mockResponse(): Response {
  return {
    json: vi.fn(),
    send: vi.fn(),
    contentType: vi.fn(),
    status: vi.fn(),
    sendStatus: vi.fn(),
    header: vi.fn(),
  } as unknown as Response;
}

type MockRequestParams = {
  headers?: { [name: string]: string };
  body?: object;
  params?: { [name: string]: string };
  query?: { [name: string]: string };
};

function mockRequest({ headers = {}, body, params = {}, query = {} }: MockRequestParams): Request {
  return {
    header: (name: string) => headers?.[name],
    headers: { ...headers },
    body,
    params: { ...params },
    query: { ...query },
    get: () => '',
  } as unknown as Request;
}

const generateJwk = async () => keystore.generate('RSA', 2048);

const createMockIdportenJwt = (payload: object, expiresIn = '5m', key: jose.JWK.Key) => {
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

const createAccessToken = (payload: string | Buffer | object, expiresIn: string | undefined, key: jose.JWK.Key) => {
  return jwt.sign(payload, key.toPEM(true), { expiresIn, algorithm: 'RS256' });
};

export { createAccessToken, createMockIdportenJwt, extractHost, extractPath, generateJwk, mockRequest, mockResponse };
export type { MockRequestParams };
