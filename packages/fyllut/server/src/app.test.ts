import { Component, InnsendingType, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import nock from "nock";
import request from "supertest";
import { createApp } from "./app";
import { config } from "./config/config";
import { createMockIdportenJwt, extractHost, extractPath, generateJwk } from "./test/testHelpers";

jest.mock("./logger.js");
jest.mock("./dekorator.js", () => ({
  getDecorator: () => {},
  createRedirectUrl: () => "",
}));

const { sendInnConfig, tokenx: tokenxConfig, formioProjectUrl } = config;

describe("app", () => {
  describe("index.html", () => {
    function createFormDefinition(innsending?: InnsendingType) {
      return {
        title: "Søknad om testhund",
        path: "testform001",
        properties: {
          innsending: innsending,
        },
        components: [] as Component[],
      } as NavFormType;
    }

    it("Renders index.html", async () => {
      await request(createApp()).get("/fyllut/").expect(200);
    });

    it("Renders index.html even if form is not found", async () => {
      nock(formioProjectUrl!).get("/form?type=form&tags=nav-skjema&path=testform001").reply(200, []);

      const res = await request(createApp()).get("/fyllut/testform001");
      expect(res.status).toEqual(200);
    });

    afterEach(() => {
      expect(nock.isDone()).toBe(true);
    });

    describe("Query param 'form'", () => {
      it("redirects with value of query param form in path", async () => {
        const res = await request(createApp()).get("/fyllut/?form=testform001").expect(302);
        expect(res.get("location")).toEqual("/fyllut/testform001");
      });

      it("redirects and includes other query params", async () => {
        const res = await request(createApp()).get("/fyllut/?form=testform001&lang=en&sub=digital").expect(302);
        expect(res.get("location")).toEqual("/fyllut/testform001?lang=en&sub=digital");
      });
    });

    describe("Form property 'innsending'", () => {
      describe("innsending KUN_PAPIR", () => {
        it("renders index.html when query param sub is missing", async () => {
          const testform001 = createFormDefinition("KUN_PAPIR");
          nock(formioProjectUrl!).get("/form?type=form&tags=nav-skjema&path=testform001").reply(200, [testform001]);

          const res = await request(createApp()).get("/fyllut/testform001").expect(200);
          expect(res.get("location")).toBeUndefined();
        });

        it("renders index.html when query param sub is paper", async () => {
          const testform001 = createFormDefinition("KUN_PAPIR");
          nock(formioProjectUrl!).get("/form?type=form&tags=nav-skjema&path=testform001").reply(200, [testform001]);

          const res = await request(createApp()).get("/fyllut/testform001?sub=paper").expect(200);
          expect(res.get("location")).toBeUndefined();
        });
      });

      describe("innsending KUN_DIGITAL", () => {
        it("redirects with query param sub=digital when it is missing", async () => {
          const testform001 = createFormDefinition("KUN_DIGITAL");
          nock(formioProjectUrl!).get("/form?type=form&tags=nav-skjema&path=testform001").reply(200, [testform001]);

          const res = await request(createApp()).get("/fyllut/testform001?lang=en").expect(302);
          expect(res.get("location")).toEqual("/fyllut/testform001?lang=en&sub=digital");
        });

        it("renders index.html when query param sub is digital", async () => {
          const testform001 = createFormDefinition("KUN_DIGITAL");
          nock(formioProjectUrl!).get("/form?type=form&tags=nav-skjema&path=testform001").reply(200, [testform001]);

          const res = await request(createApp()).get("/fyllut/testform001?sub=digital").expect(200);
          expect(res.get("location")).toBeUndefined();
        });
      });

      describe.each(["PAPIR_OG_DIGITAL", undefined])("innsending %s", (innsending) => {
        describe("query param sub is missing", () => {
          it("redirects to intropage and keeps other query params", async () => {
            const testform001 = createFormDefinition(innsending as InnsendingType);
            nock(formioProjectUrl!).get("/form?type=form&tags=nav-skjema&path=testform001").reply(200, [testform001]);

            const res = await request(createApp()).get("/fyllut/testform001/panel1?lang=en").expect(302);
            expect(res.get("location")).toEqual("/fyllut/testform001?lang=en");
          });

          it("does not redirect when intropage is requested (avoiding circular redirects)", async () => {
            const testform001 = createFormDefinition(innsending as InnsendingType);
            nock(formioProjectUrl!).get("/form?type=form&tags=nav-skjema&path=testform001").reply(200, [testform001]);

            const res = await request(createApp()).get("/fyllut/testform001").expect(200);
            expect(res.get("location")).toBeUndefined();
          });
        });

        describe("query param sub is present", () => {
          it("does not redirect to intropage when sub=digital", async () => {
            const testform001 = createFormDefinition(innsending as InnsendingType);
            nock(formioProjectUrl!).get("/form?type=form&tags=nav-skjema&path=testform001").reply(200, [testform001]);

            const res = await request(createApp()).get("/fyllut/testform001/panel1?lang=en&sub=digital").expect(200);
            expect(res.get("location")).toBeUndefined();
          });
          it("does not redirect to intropage when sub=paper", async () => {
            const testform001 = createFormDefinition(innsending as InnsendingType);
            nock(formioProjectUrl!).get("/form?type=form&tags=nav-skjema&path=testform001").reply(200, [testform001]);

            const res = await request(createApp()).get("/fyllut/testform001/panel1?lang=en&sub=paper").expect(200);
            expect(res.get("location")).toBeUndefined();
          });
        });
      });
    });
  });

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
