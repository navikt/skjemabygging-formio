import nock from "nock";
import request from "supertest";
import app from "./app.js";

const HOST_REGEX = /(http:\/\/.*nav.no).*/;
const PATH_REGEX = /http:\/\/.*nav.no(\/.*)/;

const extractHost = (url) => HOST_REGEX.exec(url)[1];
const extractPath = (url) => PATH_REGEX.exec(url)[1];

describe("app", () => {
  it("Henter config", async () => {
    await request(app)
      .get("/fyllut/config")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);
  });

  it("Returnerer feilmelding og legger på correlation_id", async () => {
    const tokenEndpoint = process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT;
    const azureOpenidScope = nock(extractHost(tokenEndpoint))
      .post(extractPath(tokenEndpoint))
      .reply(200, { access_token: "azure-access-token" });

    const skjemabyggingproxyScope = nock(process.env.SKJEMABYGGING_PROXY_URL)
      .post("/foersteside")
      .reply(400, "Validering av ident feilet. brukerId=110550, brukerType=PERSON. Kunne ikke opprette førsteside.");

    const res = await request(app).post("/fyllut/api/foersteside").expect("Content-Type", /json/).expect(500);

    expect(res.body.message).toEqual("Feil ved generering av førsteside");
    expect(res.body.correlation_id).not.toBeNull();

    azureOpenidScope.done();
    skjemabyggingproxyScope.done();
  });
});
