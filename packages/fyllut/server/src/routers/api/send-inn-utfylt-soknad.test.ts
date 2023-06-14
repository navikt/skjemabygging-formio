import { jest } from "@jest/globals";
import nock from "nock";
import { config } from "../../config/config";
import { mockRequest, mockResponse } from "../../test/testHelpers";
import sendInnUtfyltSoknad from "./send-inn-utfylt-soknad";

const SEND_LOCATION = "http://www.unittest.nav.no/sendInn/123";

const { sendInnConfig } = config;

const mockRequestWithPidAndTokenX = ({ headers = {}, body }) => {
  const req = mockRequest({ headers, body });
  req.getIdportenPid = () => "12345678911";
  req.getTokenxAccessToken = () => "tokenx-access-token-for-unittest";
  return req;
};

describe("[endpoint] send-inn/utfyltsoknad", () => {
  const innsendingsId = "innsendingsId";
  const defaultBody = {
    form: { title: "default form", components: [], properties: { skjemanummer: "NAV 12.34-56" } },
    submission: { data: {} },
    attachments: [],
    language: "nb-NO",
    translation: {},
    innsendingsId,
  };

  it("returns 201 and location header if success", async () => {
    const skjemabyggingproxyScope = nock(process.env.SKJEMABYGGING_PROXY_URL)
      .post("/exstream")
      .reply(200, { data: { result: [{ content: { data: "" } }] } });
    const sendInnNockScope = nock(sendInnConfig.host)
      .put(`${sendInnConfig.paths.utfyltSoknad}/${innsendingsId}`)
      .reply(302, "FOUND", { Location: SEND_LOCATION });
    const req = mockRequestWithPidAndTokenX({ headers: { AzureAccessToken: "azure-access-token" }, body: defaultBody });
    const res = mockResponse();
    const next = jest.fn();
    await sendInnUtfyltSoknad.put(req, res, next);

    expect(res.sendStatus).toHaveBeenLastCalledWith(201);
    expect(res.header).toHaveBeenLastCalledWith({
      "Access-Control-Expose-Headers": "Location",
      Location: SEND_LOCATION,
    });
    expect(next).not.toHaveBeenCalled();
    expect(skjemabyggingproxyScope.isDone()).toBe(true);
    expect(sendInnNockScope.isDone()).toBe(true);
  });

  it("calls next if SendInn returns error", async () => {
    const skjemabyggingproxyScope = nock(process.env.SKJEMABYGGING_PROXY_URL)
      .post("/exstream")
      .reply(200, { data: { result: [{ content: { data: "" } }] } });
    const sendInnNockScope = nock(sendInnConfig.host)
      .put(`${sendInnConfig.paths.utfyltSoknad}/${innsendingsId}`)
      .reply(500, "error body");
    const req = mockRequestWithPidAndTokenX({ body: defaultBody });
    const res = mockResponse();
    const next = jest.fn();
    await sendInnUtfyltSoknad.put(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error.functional).toBe(true);
    expect(error.message).toEqual("Feil ved kall til SendInn");
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(res.header).not.toHaveBeenCalled();
    expect(skjemabyggingproxyScope.isDone()).toBe(true);
    expect(sendInnNockScope.isDone()).toBe(true);
  });

  it("calls next if exstream returns error", async () => {
    const skjemabyggingproxyScope = nock(process.env.SKJEMABYGGING_PROXY_URL)
      .post("/exstream")
      .reply(500, "error body");
    const req = mockRequestWithPidAndTokenX({ body: defaultBody });
    const res = mockResponse();
    const next = jest.fn();
    await sendInnUtfyltSoknad.put(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error.functional).toBe(true);
    expect(error.message).toEqual("Feil ved generering av PDF hos Exstream");
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(res.header).not.toHaveBeenCalled();
    expect(skjemabyggingproxyScope.isDone()).toBe(true);
  });

  it("calls next with error if idporten pid is missing", async () => {
    const sendInnNockScope = nock(sendInnConfig.host)
      .put(`${sendInnConfig.paths.utfyltSoknad}/${innsendingsId}`)
      .reply(302, "FOUND", { Location: SEND_LOCATION });
    const req = mockRequest({ body: defaultBody });
    req.getTokenxAccessToken = () => "tokenx-access-token-for-unittest";
    const res = mockResponse();
    const next = jest.fn();
    await sendInnUtfyltSoknad.put(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error.functional).toBeFalsy();
    expect(error.message).toEqual("Missing idporten pid");
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(res.header).not.toHaveBeenCalled();
    expect(sendInnNockScope.isDone()).toBe(false);
  });

  it("calls next with error if tokenx access token is missing", async () => {
    const sendInnNockScope = nock(sendInnConfig.host)
      .put(`${sendInnConfig.paths.utfyltSoknad}/${innsendingsId}`)
      .reply(302, "FOUND", { Location: SEND_LOCATION });
    const req = mockRequest({ headers: {}, body: defaultBody });
    req.getIdportenPid = () => "12345678911";
    const res = mockResponse();
    const next = jest.fn();
    await sendInnUtfyltSoknad.put(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error.functional).toBeFalsy();
    expect(error.message).toEqual("Missing TokenX access token");
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(res.header).not.toHaveBeenCalled();
    expect(sendInnNockScope.isDone()).toBe(false);
  });
});
