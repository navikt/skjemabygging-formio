import {
  createContentService,
  createCoverPageService,
  createEntraIdTokenService,
  createNavUnitService,
  createSendinnCoverPageService,
  createSendinnFormService,
  ForstesideRequestBody,
} from '@navikt/skjemadigitalisering-shared-backend';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { createServer, Server } from 'node:http';
import request from 'supertest';
import { createApp } from '../../app';

const { download } = vi.hoisted(() => ({ download: vi.fn() }));
vi.mock('../../services', async () => {
  const { Registry } = await import('prom-client');
  return {
    sendinnCoverPageService: { downloadCoverPage: download },
    metricsRegister: new Registry(),
    decorator: { getDecorator: vi.fn() },
    idportenAuth: { authenticate: vi.fn() },
    contentService: {},
    navUnitService: {},
    sendinnFormService: {},
  };
});

const original: Form = {
  path: 'nav123456',
  title: 'Source application',
  skjemanummer: 'NAV 12-34.56',
  status: 'pending',
  publishedLanguages: ['en'],
  properties: {
    skjemanummer: 'NAV 12-34.56',
    tema: 'GEN',
    submissionTypes: ['DIGITAL'],
    subsequentSubmissionTypes: ['PAPER'],
    hideUserTypes: true,
  },
  components: [
    {
      type: 'attachment',
      key: 'first',
      navId: 'first-id',
      label: 'First document',
      properties: { vedleggskode: 'N1' },
    },
    {
      type: 'attachment',
      key: 'second',
      navId: 'second-id',
      label: 'Second document',
      properties: { vedleggskode: 'N2' },
    },
  ],
};
const selected = (navId = 'first-id', title?: string) => ({
  attachmentId: navId,
  navId,
  type: 'default',
  value: 'leggerVedNaa',
  files: [],
  ...(title === undefined ? {} : { title }),
});
const body = () => ({
  formPath: 'nav123456',
  language: 'en',
  attachmentFilter: ['N2, N1', 'N2'],
  submission: { data: { sendinnAttachment1: { first: selected() } } },
});
const pdf = Buffer.from('%PDF-1.4\ncover page fixture\n%%EOF').toString('base64');

describe('Sendinn cover page HTTP boundaries', () => {
  let server: Server;
  let baseUrl: string;
  let form: Form;
  let formStatus: number;
  let generatorStatus: number;
  let tokenStatus: number;
  let tokenResponse: unknown;
  let tokenService: ReturnType<typeof createEntraIdTokenService>;
  let translationStatus: number;
  let generatorResponse: unknown;
  let requests: { path: string; body: string; correlation?: string; authorization?: string }[];
  let generated: ForstesideRequestBody[];

  beforeAll(async () => {
    server = createServer(async (req, res) => {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      const data = Buffer.concat(chunks).toString();
      const path = req.url ?? '';
      requests.push({
        path,
        body: data,
        correlation: req.headers['x-correlation-id']?.toString(),
        authorization: req.headers.authorization,
      });
      res.setHeader('content-type', 'application/json');
      const respond = (status: number, value: unknown) => {
        res.statusCode = status;
        res.end(JSON.stringify(value));
      };
      if (path === '/health') return respond(200, {});
      if (path === '/forms-api/v1/forms/nav123456') return respond(formStatus, formStatus === 200 ? form : {});
      if (path.includes('/translations?') || path.includes('/global-translations?')) {
        return respond(translationStatus, [{ key: 'First document', en: 'Translated first' }]);
      }
      if (path === '/texas/token') {
        return respond(tokenStatus, tokenStatus === 200 ? tokenResponse : { message: 'sensitive-upstream-answer' });
      }
      if (path === '/proxy/foersteside') {
        generated.push(JSON.parse(data));
        res.setHeader('x-correlation-id', 'generator-upstream');
        return respond(
          generatorStatus,
          generatorStatus === 200 ? generatorResponse : { message: 'sensitive-upstream-answer' },
        );
      }
      respond(404, {});
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server did not start');
    baseUrl = `http://127.0.0.1:${address.port}`;
    requests = [];
    if (!(await fetch(`${baseUrl}/health`)).ok) throw new Error('Test server is not ready');
  });
  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  });
  beforeEach(() => {
    form = structuredClone(original);
    formStatus = generatorStatus = tokenStatus = translationStatus = 200;
    tokenResponse = { access_token: 'test-service-token' };
    generatorResponse = { foersteside: pdf, loepenummer: 'test-sequence' };
    requests = [];
    generated = [];
    tokenService = createEntraIdTokenService({
      tokenEndpoint: `${baseUrl}/texas/token`,
      target: 'api://test-proxy/.default',
    });
    const service = createSendinnCoverPageService({
      formService: createSendinnFormService({
        contentService: createContentService({ baseUrl: `${baseUrl}/forms-api`, source: 'latest' }),
      }),
      navUnitService: createNavUnitService({ baseUrl, consumerId: 'sendinn' }),
      coverPageService: createCoverPageService({ baseUrl: `${baseUrl}/proxy` }),
      getAccessToken: () => tokenService.getAccessToken(),
      allowTestIdentityNumbers: true,
    });
    download.mockClear();
    download.mockImplementation(service.downloadCoverPage);
  });

  it('reloads trusted source/translations, sends both ETTERSENDELSE lists and returns only a noncached base64 PDF', async () => {
    const response = await request(createApp())
      .post('/sendinn/api/cover-page?sub=digital')
      .set('x-correlation-id', 'journey-correlation')
      .send({ ...body(), form: { title: 'untrusted' }, party: { nationalIdentityNumber: 'untrusted' } })
      .expect(200);
    expect(response.body).toEqual({ pdf });
    expect(response.headers['cache-control']).toBe('no-store');
    expect(download).toHaveBeenCalledWith(expect.objectContaining({ attachmentFilter: ['N2', 'N1', 'N2'] }));
    expect(generated).toHaveLength(1);
    expect(generated[0]).toMatchObject({
      foerstesidetype: 'ETTERSENDELSE',
      navSkjemaId: 'NAV 12-34.56',
      spraakkode: 'EN',
      tema: 'GEN',
      dokumentlisteFoersteside: ['Translated first'],
      vedleggsliste: ['First document'],
      netsPostboks: '1400',
    });
    expect(generated[0]).not.toHaveProperty('bruker');
    expect(generated[0]).not.toHaveProperty('ukjentBrukerPersoninfo');
    expect(JSON.stringify(generated)).not.toContain('untrusted');
    const outbound = requests.find((entry) => entry.path === '/proxy/foersteside');
    expect(outbound).toMatchObject({ correlation: 'journey-correlation', authorization: 'Bearer test-service-token' });
    const tokenBody = new URLSearchParams(requests.find((entry) => entry.path === '/texas/token')?.body);
    expect(Object.fromEntries(tokenBody)).toEqual({
      identity_provider: 'entra_id',
      target: 'api://test-proxy/.default',
    });
    expect(requests.some((entry) => entry.path.includes('select='))).toBe(false);
  });

  it('uses a pre-generated proxy token without a Texas token request', async () => {
    tokenService = createEntraIdTokenService({
      tokenEndpoint: `${baseUrl}/texas/token`,
      target: 'api://test-proxy/.default',
      devToken: 'local-generator-token',
    });

    const response = await request(createApp()).post('/sendinn/api/cover-page').send(body()).expect(200);

    expect(response.body).toEqual({ pdf });
    expect(requests.some((entry) => entry.path === '/texas/token')).toBe(false);
    expect(requests.find((entry) => entry.path === '/proxy/foersteside')?.authorization).toBe(
      'Bearer local-generator-token',
    );
    expect(generated).toHaveLength(1);
  });

  it('reloads on every operation and rejects newly unavailable attachments without calling the generator', async () => {
    await request(createApp()).post('/sendinn/api/cover-page').send(body()).expect(200);
    form.components.shift();
    await request(createApp()).post('/sendinn/api/cover-page').send(body()).expect(400);
    expect(generated).toHaveLength(1);
    expect(requests.filter((entry) => entry.path === '/forms-api/v1/forms/nav123456')).toHaveLength(2);
  });

  it.each([
    { formPath: '../untrusted' },
    { language: 'se' },
    { attachmentFilter: {} },
    { submission: [] },
    { submission: { data: [] } },
    { submission: { data: {}, attachments: {} } },
  ])('rejects malformed HTTP input before content loading: %j', async (change) => {
    const response = await request(createApp())
      .post('/sendinn/api/cover-page')
      .send({ ...body(), ...change })
      .expect(400);
    expect(response.body).toMatchObject({ errorCode: 'BAD_REQUEST', correlationId: expect.any(String) });
    expect(requests).toEqual([]);
  });

  it('sanitizes JSON parser failures before centralized error handling', async () => {
    const response = await request(createApp())
      .post('/sendinn/api/cover-page')
      .set('content-type', 'application/json')
      .send('{"private-answer":broken}')
      .expect(400);
    expect(response.body).toMatchObject({
      errorCode: 'BAD_REQUEST',
      message: 'Invalid JSON request body',
      correlationId: expect.any(String),
    });
    expect(JSON.stringify(response.body)).not.toContain('private-answer');
    expect(requests).toEqual([]);
  });

  it.each(['missing', 'disabled', 'empty-filter'])('blocks %s content before generation', async (mode) => {
    if (mode === 'missing') formStatus = 404;
    if (mode === 'disabled') form.properties.subsequentSubmissionTypes = ['DIGITAL'];
    const payload = { ...body(), ...(mode === 'empty-filter' ? { attachmentFilter: ['unknown'] } : {}) };
    await request(createApp())
      .post('/sendinn/api/cover-page')
      .send(payload)
      .expect(mode === 'empty-filter' ? 400 : 404);
    expect(generated).toEqual([]);
    expect(requests.some((entry) => entry.path === '/texas/token')).toBe(false);
  });

  it.each(['generator', 'token', 'empty-response', 'nonpdf-response', 'malformed-token', 'translations'])(
    'returns a correlated standard %s failure without exposing upstream answers',
    async (mode) => {
      if (mode === 'generator') generatorStatus = 500;
      if (mode === 'token') tokenStatus = 500;
      if (mode === 'empty-response') generatorResponse = { foersteside: '' };
      if (mode === 'nonpdf-response') generatorResponse = { foersteside: Buffer.from('not a PDF').toString('base64') };
      if (mode === 'malformed-token') tokenResponse = {};
      if (mode === 'translations') translationStatus = 404;
      const response = await request(createApp()).post('/sendinn/api/cover-page').send(body()).expect(503);
      const localCorrelation = expect.any(String);
      expect(response.body).toMatchObject({
        errorCode: 'SERVICE_UNAVAILABLE',
        correlationId: mode === 'generator' ? 'generator-upstream' : localCorrelation,
      });
      expect(response.headers['x-correlation-id']).toBe(response.body.correlationId);
      expect(JSON.stringify(response.body)).not.toMatch(
        /sensitive-upstream-answer|test-credential|test-service-token|sendinnAttachment/,
      );
      expect(generated).toHaveLength(['token', 'malformed-token', 'translations'].includes(mode) ? 0 : 1);
    },
  );

  it('defaults to Bokmål when the request omits the language', async () => {
    const { language: _language, ...payload } = body();
    await request(createApp()).post('/sendinn/api/cover-page').send(payload).expect(200);
    expect(generated[0]).toMatchObject({ spraakkode: 'NB', dokumentlisteFoersteside: ['First document'] });
    expect(requests.some((entry) => entry.path.includes('/translations?'))).toBe(false);
  });
});
