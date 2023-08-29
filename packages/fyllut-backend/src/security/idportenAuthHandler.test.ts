import { Request } from "express";
import nock from "nock";
import jose from "node-jose";
import { createMockIdportenJwt, generateJwk, mockRequest, mockResponse } from "../test/testHelpers";
import idportenAuthHandler from "./idportenAuthHandler";

function mockRequestWithAccessToken(accessToken: string) {
  return mockRequest({
    headers: {
      "Fyllut-Submission-Method": "digital",
      Authorization: `Bearer ${accessToken}`,
    },
  }) as unknown as Request;
}

describe("idportenAuthHandler", () => {
  let key: jose.JWK.Key;
  beforeAll(async () => {
    key = await generateJwk();
    nock("https://testoidc.unittest.no")
      .get("/idporten-oidc-provider/jwk")
      .reply(200, { keys: [key.toJSON(false)] });
  });

  describe("Header Fyllut-Submission-Method digital", () => {
    it("Returns 401 when authorization header is missing", () => {
      const req = mockRequest({
        headers: { "Fyllut-Submission-Method": "digital" },
      });
      const res = mockResponse();
      const next = vi.fn();
      idportenAuthHandler(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledTimes(1);
      // @ts-expect-error
      expect(res.sendStatus.mock.calls[0][0]).toEqual(401);
      expect(next).not.toHaveBeenCalled();
      expect(typeof req.getIdportenPid).toEqual("undefined");
    });

    it("Calls next when token is successfully validated", async () => {
      const accessToken = createMockIdportenJwt({}, "1h", key);
      const req = mockRequestWithAccessToken(accessToken);
      const res = mockResponse();
      const next = vi.fn();
      await idportenAuthHandler(req, res, next);
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      expect(typeof req.getIdportenPid).toEqual("function");
    });

    it("Returns 401 when token acr is not Level4", async () => {
      const accessToken = createMockIdportenJwt({ acr: "Level3" }, "1h", key);
      const req = mockRequestWithAccessToken(accessToken);
      const res = mockResponse();
      const next = vi.fn();
      await idportenAuthHandler(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledTimes(1);
      // @ts-expect-error
      expect(res.sendStatus.mock.calls[0][0]).toEqual(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("Returns 401 when token cliend_id is not correct", async () => {
      const accessToken = createMockIdportenJwt({ client_id: "wrong-client-id" }, "1h", key);
      const req = mockRequestWithAccessToken(accessToken);
      const res = mockResponse();
      const next = vi.fn();
      await idportenAuthHandler(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledTimes(1);
      // @ts-expect-error
      expect(res.sendStatus.mock.calls[0][0]).toEqual(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("Returns 401 when token is (soon) expired", async () => {
      const accessToken = createMockIdportenJwt({}, "1ms", key);
      const req = mockRequestWithAccessToken(accessToken);
      const res = mockResponse();
      const next = vi.fn();
      await idportenAuthHandler(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledTimes(1);
      // @ts-expect-error
      expect(res.sendStatus.mock.calls[0][0]).toEqual(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("Header Submission-Type-Innsending missing", () => {
    it("Skips authentication checks", async () => {
      const req = mockRequest({
        headers: {},
      });
      const res = mockResponse();
      const next = vi.fn();
      await idportenAuthHandler(req, res, next);
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
