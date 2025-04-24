import { Component, forstesideUtils, NavFormType, SubmissionType } from '@navikt/skjemadigitalisering-shared-domain';
import nock from 'nock';
import request from 'supertest';
import { createApp } from './app';
import { config } from './config/config';
import { createMockIdportenJwt, extractHost, extractPath, generateJwk } from './test/testHelpers';

vi.mock('./dekorator.js', () => ({
  getDecorator: () => {},
  createRedirectUrl: () => '',
}));

const { sendInnConfig, tokenx: tokenxConfig, formioApiServiceUrl } = config;

describe('app', () => {
  describe('index.html', () => {
    function createFormDefinition(submissionTypes?: SubmissionType[]) {
      return {
        title: 'Søknad om testhund',
        path: 'testform001',
        properties: {
          submissionTypes,
        },
        components: [] as Component[],
      } as NavFormType;
    }

    it('Renders index.html', async () => {
      await request(createApp()).get('/fyllut/').expect(200);
    });

    it('Removes trailing slash, except for root', async () => {
      const res = await request(createApp()).get('/fyllut/testform001/').expect(308);
      expect(res.get('location')).toBe('/fyllut/testform001');
    });

    it('Returns 404 if form is not found', async () => {
      nock(formioApiServiceUrl!).get('/form?type=form&tags=nav-skjema&path=testform001').reply(200, []);

      const res = await request(createApp()).get('/fyllut/testform001');
      expect(res.status).toBe(404);
    });

    afterEach(() => {
      expect(nock.isDone()).toBe(true);
    });

    describe("Query param 'form'", () => {
      it('redirects with value of query param form in path', async () => {
        const res = await request(createApp()).get('/fyllut/?form=testform001').expect(302);
        expect(res.get('location')).toBe('/fyllut/testform001');
      });

      it('redirects and includes other query params', async () => {
        const res = await request(createApp()).get('/fyllut/?form=testform001&lang=en&sub=digital').expect(302);
        expect(res.get('location')).toBe('/fyllut/testform001?lang=en&sub=digital');
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

    describe("Form property 'submissionTypes'", () => {
      describe('submissionTypes [PAPER]', () => {
        it('renders index.html when query param sub is missing', async () => {
          const testform001 = createFormDefinition(['PAPER']);
          nock(formioApiServiceUrl!).get('/form?type=form&tags=nav-skjema&path=testform001').reply(200, [testform001]);

          const res = await request(createApp()).get('/fyllut/testform001?lang=en').expect(302);
          expect(res.get('location')).toBe('/fyllut/testform001?lang=en&sub=paper');
        });

        it('renders index.html when query param sub is paper', async () => {
          const testform001 = createFormDefinition(['PAPER']);
          nock(formioApiServiceUrl!).get('/form?type=form&tags=nav-skjema&path=testform001').reply(200, [testform001]);

          const res = await request(createApp()).get('/fyllut/testform001?sub=paper').expect(200);
          expect(res.get('location')).toBeUndefined();
        });
      });

      describe('submissionTypes [DIGITAL]', () => {
        it('redirects with query param sub=digital when it is missing', async () => {
          const testform001 = createFormDefinition(['DIGITAL']);
          nock(formioApiServiceUrl!).get('/form?type=form&tags=nav-skjema&path=testform001').reply(200, [testform001]);

          const res = await request(createApp()).get('/fyllut/testform001?lang=en').expect(302);
          expect(res.get('location')).toBe('/fyllut/testform001?lang=en&sub=digital');
        });

        it('renders index.html when query param sub is digital', async () => {
          const testform001 = createFormDefinition(['DIGITAL']);
          nock(formioApiServiceUrl!).get('/form?type=form&tags=nav-skjema&path=testform001').reply(200, [testform001]);

          const res = await request(createApp()).get('/fyllut/testform001?sub=digital').expect(200);
          expect(res.get('location')).toBeUndefined();
        });
      });

      describe('submissionTypes []', () => {
        it('redirects without query param sub if paper', async () => {
          const testform001 = createFormDefinition([]);
          nock(formioApiServiceUrl!).get('/form?type=form&tags=nav-skjema&path=testform001').reply(200, [testform001]);

          const res = await request(createApp()).get('/fyllut/testform001?lang=en&sub=paper');
          expect(res.get('location')).toBe('/fyllut/testform001?lang=en');
        });
      });

      describe('invalid query param sub', () => {
        it('redirects without query param sub if blabla', async () => {
          const testform001 = createFormDefinition(['PAPER']);
          nock(formioApiServiceUrl!).get('/form?type=form&tags=nav-skjema&path=testform001').reply(200, [testform001]);

          const res = await request(createApp()).get('/fyllut/testform001?lang=en&sub=blabla').expect(302);
          expect(res.get('location')).toBe('/fyllut/testform001?lang=en');
        });
      });

      describe('query param sub is missing', () => {
        const testform001 = {
          title: 'Søknad om testhund',
          path: 'testform001',
          properties: {
            submissionTypes: ['PAPER', 'DIGITAL'],
          },
          components: [] as Component[],
        };

        it('redirects to intropage and keeps other query params', async () => {
          nock(formioApiServiceUrl!).get('/form?type=form&tags=nav-skjema&path=testform001').reply(200, [testform001]);

          const res = await request(createApp()).get('/fyllut/testform001/panel1?lang=en').expect(302);
          expect(res.get('location')).toBe('/fyllut/testform001?lang=en');
        });

        it('does not redirect when intropage is requested (avoiding circular redirects)', async () => {
          nock(formioApiServiceUrl!).get('/form?type=form&tags=nav-skjema&path=testform001').reply(200, [testform001]);

          const res = await request(createApp()).get('/fyllut/testform001').expect(200);
          expect(res.get('location')).toBeUndefined();
        });
      });

      describe('query param sub is present', () => {
        const testform001 = {
          title: 'Søknad om testhund',
          path: 'testform001',
          properties: {
            submissionTypes: ['PAPER', 'DIGITAL'],
          },
          components: [] as Component[],
        };

        it('does not redirect to intropage when sub=digital', async () => {
          nock(formioApiServiceUrl!).get('/form?type=form&tags=nav-skjema&path=testform001').reply(200, [testform001]);

          const res = await request(createApp()).get('/fyllut/testform001/panel1?lang=en&sub=digital').expect(200);
          expect(res.get('location')).toBeUndefined();
        });

        it('does not redirect to intropage when sub=paper', async () => {
          nock(formioApiServiceUrl!).get('/form?type=form&tags=nav-skjema&path=testform001').reply(200, [testform001]);

          const res = await request(createApp()).get('/fyllut/testform001/panel1?lang=en&sub=paper').expect(200);
          expect(res.get('location')).toBeUndefined();
        });
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

  it('Looks for Authorization header when Fyllut-Submission-Method=digital', async () => {
    await request(createApp())
      .get('/fyllut/api/config')
      .set('Accept', 'application/json')
      .set('Fyllut-Submission-Method', 'digital')
      .expect(401);
  });

  it('Returns error message and a correlation_id', async () => {
    forstesideUtils.genererFoerstesideData = vi.fn();
    const tokenEndpoint = process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT!;
    const azureOpenidScope = nock(extractHost(tokenEndpoint))
      .post(extractPath(tokenEndpoint))
      .reply(200, { access_token: 'azure-access-token' });

    const skjemabyggingproxyScope = nock(process.env.SKJEMABYGGING_PROXY_URL as string)
      .post('/foersteside')
      .reply(400, 'Validering av ident feilet. brukerId=110550, brukerType=PERSON. Kunne ikke opprette førsteside.');

    const foerstesideBody = { form: JSON.stringify({ properties: {} }), submissionData: '{}' };
    const res = await request(createApp())
      .post('/fyllut/api/foersteside')
      .send(foerstesideBody)
      .expect('Content-Type', /json/)
      .expect(500);

    expect(res.body.message).toBe('Feil ved generering av førsteside');
    expect(res.body.correlation_id).not.toBeNull();

    azureOpenidScope.done();
    skjemabyggingproxyScope.done();
  });

  it('Performs TokenX exchange and retrieves pdf from exstream before calling SendInn', async () => {
    const key = await generateJwk();
    nock('https://testoidc.unittest.no')
      .get('/idporten-oidc-provider/jwk')
      .reply(200, { keys: [key.toJSON(false)] });

    const innsendingsId = '65ed0008-ec72-4c90-8b44-165d3c265da0';
    const sendInnLocation = 'http://www.unittest.nav.no/sendInn/123';
    const azureTokenEndpoint = process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT!;
    const tokenxEndpoint = 'http://tokenx-unittest.nav.no/token';
    const applicationData = {
      form: {
        components: [],
        path: 'nav123456',
        title: 'NAV 12.34-56',
        properties: { skjemanummer: 'NAV 12.34-56', tema: 'BIL' },
      },
      submission: { data: { fodselsnummerDNummerSoker: '12345678911' } },
      attachments: [],
      language: 'nb-NO',
      translation: {},
      submissionMethod: 'digital',
      innsendingsId,
    };

    const azureOpenidScope = nock(extractHost(azureTokenEndpoint))
      .post(extractPath(azureTokenEndpoint))
      .reply(200, { access_token: 'azure-access-token' });
    const skjemabyggingproxyScope = nock(process.env.SKJEMABYGGING_PROXY_URL as string)
      .post('/exstream')
      .reply(200, { data: { result: [{ content: { data: '' } }] } });
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
    skjemabyggingproxyScope.done();
    tokenxWellKnownScope.done();
    tokenEndpointNockScope.done();
    sendInnNockScope.done();
  });
});
