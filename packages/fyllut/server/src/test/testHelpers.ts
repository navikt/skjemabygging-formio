import { jest } from "@jest/globals";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import jose from "node-jose";

const HOST_REGEX = /(https?:\/\/.*nav.no).*/;
const PATH_REGEX = /https?:\/\/.*nav.no(\/.*)/;

const keystore = jose.JWK.createKeyStore();

const extractHost = (url: string): string => HOST_REGEX.exec(url)?.[1]!;
const extractPath = (url: string): string => PATH_REGEX.exec(url)?.[1]!;

function mockResponse(): Response {
  return {
    json: jest.fn(),
    sendStatus: jest.fn(),
    header: jest.fn(),
  } as unknown as Response;
}

type MockRequestParams = {
  headers: { [name: string]: string };
  body?: object;
};

function mockRequest({ headers = {}, body }: MockRequestParams): Request {
  return {
    header: (name: string) => headers[name],
    body,
    get: () => "",
  } as unknown as Request;
}

const generateJwk = async () => keystore.generate("RSA", 2048);

const createMockIdportenJwt = (payload: object, expiresIn = "5m", key: jose.JWK.Key) => {
  const { IDPORTEN_CLIENT_ID, IDPORTEN_ISSUER } = process.env;
  const obj = {
    token_type: "Bearer",
    client_id: IDPORTEN_CLIENT_ID,
    iss: IDPORTEN_ISSUER,
    acr: "Level4",
    pid: "12345678911",
    ...payload,
  };
  return createAccessToken(obj, expiresIn, key);
};

const createAccessToken = (payload: string | Buffer | object, expiresIn: string | undefined, key: jose.JWK.Key) => {
  return jwt.sign(payload, key.toPEM(true), { expiresIn, algorithm: "RS256" });
};

export { createAccessToken, createMockIdportenJwt, generateJwk, mockRequest, mockResponse, extractPath, extractHost };
