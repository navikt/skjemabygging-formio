import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import jose from 'node-jose';

const keystore = jose.JWK.createKeyStore();

export const generateJwk = async () => keystore.generate('RSA', 2048);

export function mockResponse(): Response {
  return {
    json: vi.fn(),
    sendStatus: vi.fn(),
    header: vi.fn(),
  } as unknown as Response;
}

type MockRequestData = {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: object | string;
};
export function mockRequest({ headers = {}, params = {}, body }: MockRequestData): Request {
  return {
    header: (name: string): string => headers[name] as string,
    params,
    body,
    get: (name: string) => headers[name],
  } as unknown as Request;
}

type ExpiresIn = `${number}${'ms' | 's' | 'm' | 'h'}` | number;

export const createMockJwt = (payload: object, key: jose.JWK.Key, expiresIn: ExpiresIn = '5m') => {
  const obj = {
    token_type: 'Bearer',
    ...payload,
  };
  return createAccessToken(obj, expiresIn, key);
};

const createAccessToken = async (payload: object, expiresIn: ExpiresIn, key: jose.JWK.Key) => {
  return jwt.sign(payload, key.toPEM(true), { expiresIn, algorithm: 'RS256' });
};
