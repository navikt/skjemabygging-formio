import { jest } from "@jest/globals";
import nock from "nock";
import { config } from "../../config/config";
import { mockRequest, MockRequestParams, mockResponse } from "../../test/testHelpers";
import sendInnSoknad from "./send-inn-soknad";
import { decodedResponseBody, innsendingsId, requestBody, sendInnResponseBody } from "./testdata/mellomlagring";

const { sendInnConfig } = config;

const mockRequestWithPidAndTokenX = ({ headers = {}, body, params = {} }: MockRequestParams) => {
  const req = mockRequest({ headers, body, params });
  req.getIdportenPid = () => "12345678911";
  req.getTokenxAccessToken = () => "tokenx-access-token-for-unittest";
  return req;
};

describe("[endpoint] send-inn/soknad", () => {
  const requestBodyWithInnsendingsId = { ...requestBody, innsendingsId };

  describe("GET", () => {
    it("returns with data in response body if success", async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .get(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(200, sendInnResponseBody);
      const req = mockRequestWithPidAndTokenX({
        headers: { AzureAccessToken: "azure-access-token" },
        body: requestBody,
        params: { innsendingsId },
      });
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.get(req, res, next);

      expect(res.json).toHaveBeenCalledWith(decodedResponseBody);
      expect(next).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it("returns with error if innsendingsId is invalid", async () => {
      const req = mockRequestWithPidAndTokenX({
        headers: { AzureAccessToken: "azure-access-token" },
        body: requestBody,
        params: { innsendingsId: "1234-fake-innsendingsId" },
      });
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.get(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.message).toBe(
        "1234-fake-innsendingsId er ikke en gyldig innsendingsId. Kan ikke hente mellomlagret søknad."
      );
      expect(res.json).not.toHaveBeenCalled();
    });

    it("calls next if SendInn returns error", async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .get(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(500, "error body");
      const req = mockRequestWithPidAndTokenX({
        body: requestBody,
        params: { innsendingsId },
      });
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.get(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBe(true);
      expect(error.message).toEqual("Feil ved kall til SendInn. Kan ikke hente mellomlagret søknad.");
      expect(res.json).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it("calls next with error if tokenx access token is missing", async () => {
      const req = mockRequest({ body: requestBody, params: { innsendingsId } });
      req.getIdportenPid = () => "12345678911";
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.get(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBeFalsy();
      expect(error.message).toEqual("Missing TokenX access token");
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(res.header).not.toHaveBeenCalled();
    });
  });

  describe("POST", () => {
    it("returns response body if success", async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .post(sendInnConfig.paths.soknad)
        .reply(201, sendInnResponseBody);
      const req = mockRequestWithPidAndTokenX({
        headers: { AzureAccessToken: "azure-access-token" },
        body: requestBody,
      });
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.post(req, res, next);

      expect(res.json).toHaveBeenCalledWith(sendInnResponseBody);
      expect(next).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it("calls next if SendInn returns error", async () => {
      const sendInnNockScope = nock(sendInnConfig.host).post(sendInnConfig.paths.soknad).reply(500, "error body");
      const req = mockRequestWithPidAndTokenX({ body: requestBody });
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.post(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBe(true);
      expect(error.message).toEqual("Feil ved kall til SendInn. Kan ikke starte mellomlagring av søknaden.");
      expect(res.json).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it("calls next with error if idporten pid is missing", async () => {
      const req = mockRequest({ body: requestBody });
      req.getTokenxAccessToken = () => "tokenx-access-token-for-unittest";
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.post(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBeFalsy();
      expect(error.message).toEqual("Missing idporten pid");
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(res.header).not.toHaveBeenCalled();
    });

    it("calls next with error if tokenx access token is missing", async () => {
      const req = mockRequest({ body: requestBody });
      req.getIdportenPid = () => "12345678911";
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.post(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBeFalsy();
      expect(error.message).toEqual("Missing TokenX access token");
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(res.header).not.toHaveBeenCalled();
    });
  });

  describe("PUT", () => {
    it("returns response body if success", async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .put(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(200, requestBodyWithInnsendingsId);
      const req = mockRequestWithPidAndTokenX({
        headers: { AzureAccessToken: "azure-access-token" },
        body: requestBodyWithInnsendingsId,
      });
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.put(req, res, next);

      expect(res.json).toHaveBeenCalledWith(requestBodyWithInnsendingsId);
      expect(next).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it("calls next if SendInn returns error", async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .put(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(500, "error body");
      const req = mockRequestWithPidAndTokenX({ body: requestBodyWithInnsendingsId });
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.put(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBe(true);
      expect(error.message).toEqual("Feil ved kall til SendInn. Kan ikke oppdatere mellomlagret søknad.");
      expect(res.json).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it("calls next with error if idporten pid is missing", async () => {
      const req = mockRequest({ body: requestBodyWithInnsendingsId });
      req.getTokenxAccessToken = () => "tokenx-access-token-for-unittest";
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.put(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBeFalsy();
      expect(error.message).toEqual("Missing idporten pid");
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(res.header).not.toHaveBeenCalled();
    });

    it("calls next with error if tokenx access token is missing", async () => {
      const req = mockRequest({ body: requestBodyWithInnsendingsId });
      req.getIdportenPid = () => "12345678911";
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.put(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBeFalsy();
      expect(error.message).toEqual("Missing TokenX access token");
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(res.header).not.toHaveBeenCalled();
    });
  });

  describe("DELETE", () => {
    it("returns with confirmation in response body if success", async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .delete(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(200, { status: "OK" });
      const req = mockRequestWithPidAndTokenX({
        headers: { AzureAccessToken: "azure-access-token" },
        body: requestBody,
        params: { innsendingsId },
      });
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.delete(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ status: "OK" });
      expect(next).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it("returns with error if innsendingsId is invalid", async () => {
      const req = mockRequestWithPidAndTokenX({
        headers: { AzureAccessToken: "azure-access-token" },
        body: requestBody,
        params: { innsendingsId: "1234-fake-innsendingsId" },
      });
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.delete(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.message).toBe(
        "1234-fake-innsendingsId er ikke en gyldig innsendingsId. Kan ikke slette mellomlagret søknad."
      );
      expect(res.json).not.toHaveBeenCalled();
    });

    it("calls next if SendInn returns error", async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .delete(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(500, "error body");
      const req = mockRequestWithPidAndTokenX({
        body: requestBody,
        params: { innsendingsId },
      });
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.delete(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBe(true);
      expect(error.message).toEqual("Feil ved kall til SendInn. Kan ikke slette mellomlagret søknad.");
      expect(res.json).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it("calls next with error if tokenx access token is missing", async () => {
      const req = mockRequest({ body: requestBody, params: { innsendingsId } });
      req.getIdportenPid = () => "12345678911";
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.delete(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBeFalsy();
      expect(error.message).toEqual("Missing TokenX access token");
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(res.header).not.toHaveBeenCalled();
    });
  });
});
