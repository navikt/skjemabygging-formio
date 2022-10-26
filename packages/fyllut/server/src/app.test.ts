import nock from "nock";
import request from "supertest";
import { createApp } from "./app";
import { config } from "./config/config";
import { createMockIdportenJwt, extractHost, extractPath, generateJwk } from "./test/testHelpers";

jest.mock("./logger.js");

const { sendInnConfig, tokenx: tokenxConfig } = config;

describe("app", () => {
  it("Fetches config", async () => {
    await request(createApp())
      .get("/fyllut/api/config")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);
  });

  it("Looks for Authorization header when Fyllut-Submission-Method=digital", async () => {
    await request(createApp())
      .get("/fyllut/api/config")
      .set("Accept", "application/json")
      .set("Fyllut-Submission-Method", "digital")
      .expect(401);
  });

  it("Returns error message and a correlation_id", async () => {
    const tokenEndpoint = process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT!;
    const azureOpenidScope = nock(extractHost(tokenEndpoint))
      .post(extractPath(tokenEndpoint))
      .reply(200, { access_token: "azure-access-token" });

    const skjemabyggingproxyScope = nock(process.env.SKJEMABYGGING_PROXY_URL as string)
      .post("/foersteside")
      .reply(400, "Validering av ident feilet. brukerId=110550, brukerType=PERSON. Kunne ikke opprette førsteside.");

    const res = await request(createApp()).post("/fyllut/api/foersteside").expect("Content-Type", /json/).expect(500);

    expect(res.body.message).toEqual("Feil ved generering av førsteside");
    expect(res.body.correlation_id).not.toBeNull();

    azureOpenidScope.done();
    skjemabyggingproxyScope.done();
  });

  it("Performs TokenX exchange before calling SendInn", async () => {
    let key = await generateJwk();
    nock("https://testoidc.unittest.no")
      .get("/idporten-oidc-provider/jwk")
      .reply(200, { keys: [key.toJSON(false)] });

    const sendInnLocation = "http://www.unittest.nav.no/sendInn/123";
    const tokenEndpoint = "http://tokenx-unittest.nav.no/token";
    const applicationData = {
      form: { components: [], properties: { skjemanummer: "NAV 12.34-56" } },
      submission: {},
      attachments: [],
      language: "nb-NO",
      translations: {},
    };

    const tokenxWellKnownScope = nock(extractHost(tokenxConfig?.wellKnownUrl!))
      .get(extractPath(tokenxConfig?.wellKnownUrl!))
      .reply(200, { token_endpoint: tokenEndpoint });
    const tokenEndpointNockScope = nock(extractHost(tokenEndpoint))
      .post(extractPath(tokenEndpoint))
      .reply(200, { access_token: "123456" }, { "Content-Type": "application/json" });
    const sendInnNockScope = nock(sendInnConfig?.host as string)
      .post(sendInnConfig?.paths.leggTilVedlegg as string)
      .reply(302, "FOUND", { Location: sendInnLocation });

    const res = await request(createApp())
      .post("/fyllut/api/send-inn")
      .send(applicationData)
      .set("Fyllut-Submission-Method", "digital")
      .set("Authorization", `Bearer ${createMockIdportenJwt({ pid: "12345678911" }, undefined, key)}`); // <-- injected by idporten sidecar
    expect(res.status).toEqual(201);
    expect(res.headers["location"]).toMatch(sendInnLocation);

    tokenxWellKnownScope.done();
    tokenEndpointNockScope.done();
    sendInnNockScope.done();
  });
});
