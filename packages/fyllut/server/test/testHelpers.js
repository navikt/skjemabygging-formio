import { jest } from "@jest/globals";
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

export { generateJwk, mockRequest, mockResponse, extractPath, extractHost };
