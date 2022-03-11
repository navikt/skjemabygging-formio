import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import idportenAuthHandler from "./idportenAuthHandler.js";

const createAccessToken = (payload, expiresIn) => {
  return jwt.sign(payload, "secret", { expiresIn });
};

function mockResponse() {
  return {
    sendStatus: jest.fn(),
  };
}

function mockRequest({ headers = {} }) {
  return {
    header: (name) => headers[name],
  };
}

const { IDPORTEN_CLIENT_ID } = process.env;

const validTokenPayload = {
  token_type: "Bearer",
  client_id: IDPORTEN_CLIENT_ID,
  acr: "Level4",
};

function mockRequestWithAccessToken(accessToken) {
  return mockRequest({
    headers: {
      "Fyllut-Innsending": "digital",
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

describe("idportenAuthHandler", () => {
  describe("Header Fyllut-Innsending digital", () => {
    it("Returns 401 when authorization header is missing", () => {
      const req = mockRequest({
        headers: { "Fyllut-Innsending": "digital" },
      });
      const res = mockResponse();
      const next = jest.fn();
      idportenAuthHandler(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledTimes(1);
      expect(res.sendStatus.mock.calls[0][0]).toEqual(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("Calls next when token is successfully validated", () => {
      const accessToken = createAccessToken(validTokenPayload, "1h");
      const req = mockRequestWithAccessToken(accessToken);
      const res = mockResponse();
      const next = jest.fn();
      idportenAuthHandler(req, res, next);
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("Returns 401 when token acr is not Level4", () => {
      const accessToken = createAccessToken(
        {
          ...validTokenPayload,
          acr: "Level3",
        },
        "1h"
      );
      const req = mockRequestWithAccessToken(accessToken);
      const res = mockResponse();
      const next = jest.fn();
      idportenAuthHandler(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledTimes(1);
      expect(res.sendStatus.mock.calls[0][0]).toEqual(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("Returns 401 when token cliend_id is not correct", () => {
      const accessToken = createAccessToken(
        {
          ...validTokenPayload,
          client_id: "wrong-client-id",
        },
        "1h"
      );
      const req = mockRequestWithAccessToken(accessToken);
      const res = mockResponse();
      const next = jest.fn();
      idportenAuthHandler(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledTimes(1);
      expect(res.sendStatus.mock.calls[0][0]).toEqual(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("Returns 401 when token is (soon) expired", () => {
      const accessToken = createAccessToken(validTokenPayload, "1ms");
      const req = mockRequestWithAccessToken(accessToken);
      const res = mockResponse();
      const next = jest.fn();
      idportenAuthHandler(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledTimes(1);
      expect(res.sendStatus.mock.calls[0][0]).toEqual(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("Header Fyllut-Innsending missing", () => {
    it("Skips authentication checks", () => {
      const req = mockRequest({
        headers: {},
      });
      const res = mockResponse();
      const next = jest.fn();
      idportenAuthHandler(req, res, next);
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
