import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import request from 'supertest';
import { createApp } from './app';
import { config } from './config/config';
import { fetchedUrls } from './test/testHelpers';

vi.mock('./dekorator', () => ({
  getDecorator: () => {},
  createRedirectUrl: () => '',
}));

const { formsApiUrl, norg2 } = config;

describe('app', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('index.html', () => {
    it('Renders index.html', async () => {
      await request(createApp()).get('/fyllut/').expect(200);
    });

    it('Removes trailing slash, except for root', async () => {
      const res = await request(createApp()).get('/fyllut/testform001/').expect(308);
      expect(res.get('location')).toBe('/fyllut/testform001');
    });

    it('Returns 404 if form is not found', async () => {
      const formFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(null, { status: 404 }));

      const res = await request(createApp()).get('/fyllut/testform001');
      expect(res.status).toBe(404);
      expect(fetchedUrls(formFetch)).toEqual([`${formsApiUrl}/v1/forms/testform001`]);
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
    const formFetch = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(Response.json({ message: 'not found', correlationId: 'corr-1' }, { status: 404 }));

    const res = await request(createApp())
      .get('/fyllut/api/forms/testform001')
      .set('Accept', 'application/json')
      .expect(404);

    expect(res.body).toMatchObject({
      message: 'not found',
      errorCode: 'NOT_FOUND',
      correlationId: 'corr-1',
    });

    expect(fetchedUrls(formFetch)).toEqual([`${formsApiUrl}/v1/forms/testform001`]);
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
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(Response.json({ access_token: 'azure-access-token' }))
      .mockResolvedValueOnce(
        new Response(
          'Validering av ident feilet. brukerId=110550, brukerType=PERSON. Kunne ikke opprette førsteside.',
          {
            status: 400,
          },
        ),
      );

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

    expect(fetchedUrls(fetchSpy)).toEqual([tokenEndpoint, `${process.env.SKJEMABYGGING_PROXY_URL}/foersteside`]);
  });

  it('Returns the new enhetsliste error response contract', async () => {
    const norg2Fetch = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(Response.json({ message: 'upstream unavailable' }, { status: 503 }));

    const res = await request(createApp()).get('/fyllut/api/enhetsliste').expect('Content-Type', /json/).expect(503);

    expect(res.body.errorCode).toBe('SERVICE_UNAVAILABLE');
    expect(res.body.correlationId).not.toBeNull();
    expect(res.body.message).toBe('upstream unavailable');
    expect(res.body.userMessage).toBe(TEXTS.statiske.error.serverErrorTitle);
    expect(res.headers['x-correlation-id']).toBe(res.body.correlationId);

    expect(norg2Fetch).toHaveBeenCalledExactlyOnceWith(
      `${norg2.url}/norg2/api/v1/enhet?enhetStatusListe=AKTIV`,
      expect.anything(),
    );
  });
});
