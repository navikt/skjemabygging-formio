import nock from 'nock';
import { config } from '../../config/config';
import { mockRequest, mockResponse } from '../../test/testHelpers';
import sendInn from './send-inn.js';

const SEND_LOCATION = 'http://www.unittest.nav.no/sendInn/123';

const { sendInnConfig } = config;

describe('[endpoint] send-inn', () => {
  const defaultBody = {
    form: { components: [], properties: { skjemanummer: 'NAV 12.34-56' } },
    submission: { data: {} },
    attachments: [],
    language: 'nb-NO',
    translations: {},
  };

  const bodyWithTranslations = {
    form: { title: 'Original title', components: [], properties: { skjemanummer: 'NAV 12.34-56' } },
    submission: { data: {} },
    attachments: [{ label: 'vedlegg1' }, { label: 'vedlegg2' }],
    language: 'en',
    translations: { 'Original title': 'Translated title', vedlegg1: 'attachment1', vedlegg2: 'attachment2' },
  };

  it('returns 201 and location header if success', async () => {
    const skjemabyggingproxyScope = nock(process.env.SKJEMABYGGING_PROXY_URL)
      .post('/exstream')
      .reply(200, { data: { result: [{ content: { data: '' } }] } });
    const sendInnNockScope = nock(sendInnConfig.host)
      .post(sendInnConfig.paths.leggTilVedlegg)
      .reply(302, 'FOUND', { Location: SEND_LOCATION });
    const req = mockRequest({ headers: { AzureAccessToken: 'azure-access-token' }, body: defaultBody });
    req.getIdportenPid = () => '12345678911';
    req.getTokenxAccessToken = () => 'tokenx-access-token-for-unittest';
    const res = mockResponse();
    const next = vi.fn();
    await sendInn.post(req, res, next);

    expect(res.sendStatus).toHaveBeenLastCalledWith(201);
    expect(res.header).toHaveBeenLastCalledWith({
      'Access-Control-Expose-Headers': 'Location',
      Location: SEND_LOCATION,
    });
    expect(next).not.toHaveBeenCalled();
    expect(skjemabyggingproxyScope.isDone()).toBe(true);
    expect(sendInnNockScope.isDone()).toBe(true);
  });

  it('translates metadata', async () => {
    let postedBody;
    const skjemabyggingproxyScope = nock(process.env.SKJEMABYGGING_PROXY_URL)
      .post('/exstream')
      .reply(200, { data: { result: [{ content: { data: '' } }] } });
    const sendInnNockScope = nock(sendInnConfig.host)
      .post(sendInnConfig.paths.leggTilVedlegg, (body) => (postedBody = body))
      .reply(302, 'FOUND', { Location: SEND_LOCATION });
    const req = mockRequest({ headers: { AzureAccessToken: 'azure-access-token' }, body: bodyWithTranslations });
    req.getIdportenPid = () => '12345678911';
    req.getTokenxAccessToken = () => 'tokenx-access-token-for-unittest';
    const res = mockResponse();
    const next = vi.fn();
    await sendInn.post(req, res, next);

    expect(postedBody.tittel).toBe('Translated title');
    expect(postedBody.hoveddokument.tittel).toBe('Translated title');
    expect(postedBody.hoveddokument.label).toBe('Translated title');
    expect(postedBody.vedleggsListe[0].label).toBe('attachment1');
    expect(postedBody.vedleggsListe[1].label).toBe('attachment2');
    expect(skjemabyggingproxyScope.isDone()).toBe(true);
    expect(sendInnNockScope.isDone()).toBe(true);
  });

  it('calls next if SendInn returns error', async () => {
    const skjemabyggingproxyScope = nock(process.env.SKJEMABYGGING_PROXY_URL)
      .post('/exstream')
      .reply(200, { data: { result: [{ content: { data: '' } }] } });
    const sendInnNockScope = nock(sendInnConfig.host).post(sendInnConfig.paths.leggTilVedlegg).reply(500, 'error body');
    const req = mockRequest({ body: defaultBody });
    req.getIdportenPid = () => '12345678911';
    req.getTokenxAccessToken = () => 'tokenx-access-token-for-unittest';
    const res = mockResponse();
    const next = vi.fn();
    await sendInn.post(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error.functional).toBe(true);
    expect(error.message).toBe('Feil ved kall til SendInn');
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(res.header).not.toHaveBeenCalled();
    expect(skjemabyggingproxyScope.isDone()).toBe(true);
    expect(sendInnNockScope.isDone()).toBe(true);
  });

  it('calls next if exstream returns error', async () => {
    const skjemabyggingproxyScope = nock(process.env.SKJEMABYGGING_PROXY_URL)
      .post('/exstream')
      .reply(500, 'error body');
    const req = mockRequest({ body: defaultBody });
    req.getIdportenPid = () => '12345678911';
    req.getTokenxAccessToken = () => 'tokenx-access-token-for-unittest';
    const res = mockResponse();
    const next = vi.fn();
    await sendInn.post(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error.functional).toBe(true);
    expect(error.message).toBe('Feil ved generering av PDF hos Exstream');
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(res.header).not.toHaveBeenCalled();
    expect(skjemabyggingproxyScope.isDone()).toBe(true);
  });

  it('calls next with error if idporten pid is missing', async () => {
    const sendInnNockScope = nock(sendInnConfig.host)
      .post(sendInnConfig.paths.leggTilVedlegg)
      .reply(302, 'FOUND', { Location: SEND_LOCATION });
    const req = mockRequest({ body: defaultBody });
    req.getTokenxAccessToken = () => 'tokenx-access-token-for-unittest';
    const res = mockResponse();
    const next = vi.fn();
    await sendInn.post(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error.functional).toBeFalsy();
    expect(error.message).toBe('Missing idporten pid');
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(res.header).not.toHaveBeenCalled();
    expect(sendInnNockScope.isDone()).toBe(false);
  });

  it('calls next with error if tokenx access token is missing', async () => {
    const sendInnNockScope = nock(sendInnConfig.host)
      .post(sendInnConfig.paths.leggTilVedlegg)
      .reply(302, 'FOUND', { Location: SEND_LOCATION });
    const req = mockRequest({ body: defaultBody });
    req.getIdportenPid = () => '12345678911';
    const res = mockResponse();
    const next = vi.fn();
    await sendInn.post(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error.functional).toBeFalsy();
    expect(error.message).toBe('Missing TokenX access token');
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(res.header).not.toHaveBeenCalled();
    expect(sendInnNockScope.isDone()).toBe(false);
  });
});
