import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import jose from "node-jose";

const HOST_REGEX = /(https?:\/\/.*nav.no).*/;
const PATH_REGEX = /https?:\/\/.*nav.no(\/.*)/;

const keystore = jose.JWK.createKeyStore();

const extractHost = (url) => HOST_REGEX.exec(url)[1];
const extractPath = (url) => PATH_REGEX.exec(url)[1];

function mockResponse() {
  return {
    json: jest.fn(),
    sendStatus: jest.fn(),
    header: jest.fn(),
  };
}

function mockRequest({ headers = {}, body }) {
  return {
    header: (name) => headers[name],
    body,
  };
}

const generateJwk = async (includePrivate) => {
  const result = await keystore.generate("RSA", 1024);
  return result.toJSON(includePrivate);
};

const createMockIdportenJwt = (pid, expiresIn = "5m") => {
  const { IDPORTEN_CLIENT_ID } = process.env;
  const payload = {
    token_type: "Bearer",
    client_id: IDPORTEN_CLIENT_ID,
    acr: "Level4",
    pid,
  };
  return createAccessToken(payload, expiresIn);
};

const createAccessToken = (payload, expiresIn) => {
  return jwt.sign(payload, "secret", { expiresIn });
};

export { createAccessToken, createMockIdportenJwt, generateJwk, mockRequest, mockResponse, extractPath, extractHost };
