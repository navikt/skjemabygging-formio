import { jest } from "@jest/globals";
import nock from "nock";
import { config } from "../../config/config";
import { mockRequest, MockRequestParams, mockResponse } from "../../test/testHelpers";
import sendInnSoknad from "./send-inn-soknad";

const { sendInnConfig } = config;

const mockRequestWithPidAndTokenX = ({ headers = {}, body }: MockRequestParams) => {
  const req = mockRequest({ headers, body });
  req.getIdportenPid = () => "12345678911";
  req.getTokenxAccessToken = () => "tokenx-access-token-for-unittest";
  return req;
};

describe("[endpoint] send-inn/soknad", () => {
  const innsendingsId = "12345678-1234-1234-1234-12345678abcd";
  const defaultBody = {
    form: { title: "default form", components: [], properties: { skjemanummer: "NAV 12.34-56" } },
    submission: { data: {} },
    attachments: [],
    language: "nb-NO",
    translation: {},
  };
  const bodyWithInnsendingsId = { ...defaultBody, innsendingsId };

  describe("POST", () => {
    it("returns response body if success", async () => {
      const sendInnNockScope = nock(sendInnConfig.host).post(sendInnConfig.paths.soknad).reply(201, defaultBody);
      const req = mockRequestWithPidAndTokenX({
        headers: { AzureAccessToken: "azure-access-token" },
        body: defaultBody,
      });
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.post(req, res, next);

      expect(res.json).toHaveBeenCalledWith(defaultBody);
      expect(next).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it("calls next if SendInn returns error", async () => {
      const sendInnNockScope = nock(sendInnConfig.host).post(sendInnConfig.paths.soknad).reply(500, "error body");
      const req = mockRequestWithPidAndTokenX({ body: defaultBody });
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.post(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBe(true);
      expect(error.message).toEqual("Feil ved kall til SendInn");
      expect(res.json).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it("calls next with error if idporten pid is missing", async () => {
      const sendInnNockScope = nock(sendInnConfig.host).post(sendInnConfig.paths.soknad).reply(201, defaultBody);
      const req = mockRequest({ body: defaultBody });
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
      expect(sendInnNockScope.isDone()).toBe(false);
    });

    it("calls next with error if tokenx access token is missing", async () => {
      const sendInnNockScope = nock(sendInnConfig.host).post(sendInnConfig.paths.soknad).reply(201, defaultBody);
      const req = mockRequest({ body: defaultBody });
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
      expect(sendInnNockScope.isDone()).toBe(false);
    });
  });

  describe("PUT", () => {
    it("returns response body if success", async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .put(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(200, bodyWithInnsendingsId);
      const req = mockRequestWithPidAndTokenX({
        headers: { AzureAccessToken: "azure-access-token" },
        body: bodyWithInnsendingsId,
      });
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.put(req, res, next);

      expect(res.json).toHaveBeenCalledWith(bodyWithInnsendingsId);
      expect(next).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it("calls next if SendInn returns error", async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .put(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(500, "error body");
      const req = mockRequestWithPidAndTokenX({ body: bodyWithInnsendingsId });
      const res = mockResponse();
      const next = jest.fn();
      await sendInnSoknad.put(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBe(true);
      expect(error.message).toEqual("Feil ved kall til SendInn");
      expect(res.json).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it("calls next with error if idporten pid is missing", async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .put(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(200, bodyWithInnsendingsId);
      const req = mockRequest({ body: bodyWithInnsendingsId });
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
      expect(sendInnNockScope.isDone()).toBe(false);
    });

    it("calls next with error if tokenx access token is missing", async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .put(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(200, bodyWithInnsendingsId);
      const req = mockRequest({ body: bodyWithInnsendingsId });
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
      expect(sendInnNockScope.isDone()).toBe(false);
    });
  });
});
