import { readFileSync } from 'fs';
import nock from 'nock';
import path from 'path';
import request from 'supertest';
import { createApp } from './app';
import { config } from './config/config';
import { createMockIdportenJwt, extractHost, extractPath, generateJwk } from './test/testHelpers';

vi.mock('./dekorator', () => ({
  getDecorator: () => {},
  createRedirectUrl: () => '',
}));

const { sendInnConfig, tokenx: tokenxConfig, formsApiUrl, norg2 } = config;
const filePathSoknad = path.join(process.cwd(), '/src/test/testdata/documents/test-skjema.pdf');
const soknadPdf = readFileSync(filePathSoknad);

describe('app', () => {
  describe('index.html', () => {
    it('Renders index.html', async () => {
      await request(createApp()).get('/fyllut/').expect(200);
    });

    it('Removes trailing slash, except for root', async () => {
      const res = await request(createApp()).get('/fyllut/testform001/').expect(308);
      expect(res.get('location')).toBe('/fyllut/testform001');
    });

    it('Returns 404 if form is not found', async () => {
      nock(formsApiUrl).get('/v1/forms/testform001').query(true).reply(404);

      const res = await request(createApp()).get('/fyllut/testform001');
      expect(res.status).toBe(404);
    });

    afterEach(() => {
      if (!nock.isDone()) {
        nock.cleanAll();
        throw new Error('Pending nock interceptors not used');
      }
    });

    describe("Query param 'form'", () => {
      it('redirects with value of query param form in path', async () => {
        const res = await request(createApp()).get('/fyllut/?form=testform001').expect(302);
        expect(res.get('location')).toBe('/fyllut/testform001');
      });

      it('redirects and includes other query params', async () => {
        const res = await request(createApp()).get('/fyllut/?form=testform001&lang=en&sub=paper').expect(302);
        expect(res.get('location')).toBe('/fyllut/testform001?lang=en&sub=paper');
      });
    });

    describe("Query param 'innsendingsId'", () => {
      it('redirects with sub=digital if it was not present', async () => {
        const res = await request(createApp()).get('/fyllut/testform001?innsendingsId=12345678').expect(302);
        expect(res.get('location')).toBe('/fyllut/testform001?innsendingsId=12345678&sub=digital');
      });

      it("redirects and changes sub to 'digital' if it was something else", async () => {
        const res = await request(createApp()).get('/fyllut/testform001?innsendingsId=12345678&sub=paper').expect(302);
        expect(res.get('location')).toBe('/fyllut/testform001?innsendingsId=12345678&sub=digital');
      });

      it('preserves other query params and moves query param form to the path', async () => {
        const res = await request(createApp())
          .get('/fyllut/?form=testform001&innsendingsId=12345678&lang=en')
          .expect(302);
        expect(res.get('location')).toBe('/fyllut/testform001?innsendingsId=12345678&lang=en&sub=digital');
      });
    });
  });

  it('Fetches config', async () => {
    await request(createApp())
      .get('/fyllut/api/config')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
  });

  it('returns a 404 response error when an api form is not found', async () => {
    const formScope = nock(formsApiUrl)
      .get('/v1/forms/testform001')
      .query(true)
      .reply(404, { message: 'not found', correlationId: 'corr-1' }, { 'Content-Type': 'application/json' });

    const res = await request(createApp())
      .get('/fyllut/api/forms/testform001')
      .set('Accept', 'application/json')
      .expect(404);

    expect(res.body).toMatchObject({
      message: 'not found',
      errorCode: 'NOT_FOUND',
      correlationId: 'corr-1',
    });

    formScope.done();
  });

  it('Looks for Authorization header when Fyllut-Submission-Method=digital', async () => {
    await request(createApp())
      .get('/fyllut/api/config')
      .set('Accept', 'application/json')
      .set('Fyllut-Submission-Method', 'digital')
      .expect(401);
  });

  it('Returns error message and a correlationId', async () => {
    const tokenEndpoint = process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT!;
    const azureOpenidScope = nock(extractHost(tokenEndpoint))
      .post(extractPath(tokenEndpoint))
      .reply(200, { access_token: 'azure-access-token' });

    const skjemabyggingproxyScope = nock(process.env.SKJEMABYGGING_PROXY_URL as string)
      .post('/foersteside')
      .reply(400, 'Validering av ident feilet. brukerId=110550, brukerType=PERSON. Kunne ikke opprette førsteside.');

    const foerstesideBody = {
      foerstesidetype: 'ETTERSENDELSE',
      navSkjemaId: 'NAV 10.10.10',
      spraakkode: 'NB',
      overskriftstittel: 'Tittel',
      arkivtittel: 'Tittel',
      tema: 'HJE',
    };
    const res = await request(createApp())
      .post('/fyllut/api/foersteside')
      .send(foerstesideBody)
      .expect('Content-Type', /json/)
      .expect(500);

    expect(res.body.message).toBe('Feil ved generering av førsteside');
    expect(res.body.correlationId).not.toBeNull();

    azureOpenidScope.done();
    skjemabyggingproxyScope.done();
  });

  it('Returns the new enhetsliste error response contract', async () => {
    const norg2Scope = nock(norg2.url).get('/norg2/api/v1/enhet').query({ enhetStatusListe: 'AKTIV' }).reply(503, {
      message: 'upstream unavailable',
    });

    const res = await request(createApp()).get('/fyllut/api/enhetsliste').expect('Content-Type', /json/).expect(503);

    expect(res.body.errorCode).toBe('SERVICE_UNAVAILABLE');
    expect(res.body.correlation_id).not.toBeNull();
    expect(res.body.body).toEqual({ message: 'upstream unavailable' });

    norg2Scope.done();
  });

  it('Performs TokenX exchange and retrieves pdf from pdf generator before calling SendInn', async () => {
    const key = await generateJwk();
    nock('https://testoidc.unittest.no')
      .get('/idporten-oidc-provider/jwk')
      .reply(200, { keys: [key.toJSON(false)] });

    const innsendingsId = '65ed0008-ec72-4c90-8b44-165d3c265da0';
    const sendInnLocation = 'http://www.unittest.nav.no/sendInn/123';
    const azureTokenEndpoint = process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT!;
    const tokenxEndpoint = 'http://tokenx-unittest.nav.no/token';
    const encodedSoknadPdf = soknadPdf.toString('base64');
    const applicationData = {
      formPath: 'nav123456',
      submission: { data: { fodselsnummerDNummerSoker: '12345678911' } },
      attachments: [],
      language: 'nb',
      submissionMethod: 'digital',
      innsendingsId,
    };

    const azureOpenidScope = nock(extractHost(azureTokenEndpoint))
      .post(extractPath(azureTokenEndpoint))
      .reply(200, { access_token: 'azure-access-token' });
    const formScope = nock(formsApiUrl)
      .get('/v1/forms/nav123456')
      .query(true)
      .reply(200, {
        skjemanummer: 'NAV 12.34-56',
        title: 'NAV 12.34-56',
        path: 'nav123456',
        properties: { skjemanummer: 'NAV 12.34-56', tema: 'BIL' },
        components: [],
      });
    const skjemabyggingproxyScope = nock(process.env.FAMILIE_PDF_GENERATOR_URL as string)
      .post('/api/pdf/v3/opprett-pdf')
      .reply(200, { content: encodedSoknadPdf }, { 'Content-Type': 'application/json' });
    const globalTranslationsScope = nock(formsApiUrl).get('/v1/global-translations').query(true).reply(200, []);
    const formTranslationsScope = nock(formsApiUrl).get('/v1/forms/nav123456/translations').query(true).reply(200, []);
    const tokenxWellKnownScope = nock(extractHost(tokenxConfig?.wellKnownUrl))
      .get(extractPath(tokenxConfig?.wellKnownUrl))
      .reply(200, { token_endpoint: tokenxEndpoint });
    const tokenEndpointNockScope = nock(extractHost(tokenxEndpoint))
      .post(extractPath(tokenxEndpoint))
      .reply(200, { access_token: '123456' }, { 'Content-Type': 'application/json' });
    const sendInnNockScope = nock(sendInnConfig?.host)
      .put(`${sendInnConfig?.paths.utfyltSoknad}/${innsendingsId}`)
      .reply(302, 'FOUND', { Location: sendInnLocation });

    const res = await request(createApp())
      .put('/fyllut/api/send-inn/utfyltsoknad')
      .send(applicationData)
      .set('Fyllut-Submission-Method', 'digital')
      .set('Authorization', `Bearer ${createMockIdportenJwt({ pid: '12345678911' }, undefined, key)}`); // <-- injected by idporten sidecar
    expect(res.status).toBe(201);
    expect(res.headers['location']).toMatch(sendInnLocation);

    azureOpenidScope.done();
    formScope.done();
    skjemabyggingproxyScope.done();
    globalTranslationsScope.done();
    formTranslationsScope.done();
    tokenxWellKnownScope.done();
    tokenEndpointNockScope.done();
    sendInnNockScope.done();
  });
});
