import { readFileSync } from 'fs';
import nock from 'nock';
import path from 'path';
import { config } from '../../config/config';
import { mockRequest, MockRequestParams, mockResponse } from '../../test/testHelpers';
import sendInnUtfyltSoknad from './send-inn-utfylt-soknad';

const SEND_LOCATION = 'http://www.unittest.nav.no/sendInn/123';

const { formsApiUrl, sendInnConfig } = config;

const mockRequestWithPidAndTokenX = ({ headers = {}, body }: MockRequestParams) => {
  const req = mockRequest({ headers, body });
  req.getIdportenPid = () => '12345678911';
  req.getTokenxAccessToken = () => 'tokenx-access-token-for-unittest';
  req.getEnvQualifier = () => undefined;
  return req;
};
const filePathSoknad = path.join(process.cwd(), '/src/test/testdata/documents/test-skjema.pdf');
const soknadPdf = readFileSync(filePathSoknad);

describe('[endpoint] send-inn/utfyltsoknad', () => {
  const innsendingsId = '12345678-1234-1234-1234-12345678abcd';
  const encodedSoknadPdf = soknadPdf.toString('base64');
  const defaultBody = {
    form: { title: 'default form', components: [], properties: { skjemanummer: 'NAV 12.34-56' } },
    submission: { data: {} },
    attachments: [],
    language: 'nb-NO',
    formPath: 'default-form',
    innsendingsId,
  };

  it('returns 201 and location header if success', async () => {
    const skjemabyggingproxyScope = nock(process.env.FAMILIE_PDF_GENERATOR_URL!)
      .post('/api/pdf/v3/opprett-pdf')
      .reply(200, { content: encodedSoknadPdf }, { 'Content-Type': 'application/json' });
    const globalTranslationsScope = nock(formsApiUrl).get('/v1/global-translations').reply(200, []);
    const formTranslationsScope = nock(formsApiUrl).get('/v1/forms/default-form/translations').reply(200, []);
    const sendInnNockScope = nock(sendInnConfig.host)
      .put(`${sendInnConfig.paths.utfyltSoknad}/${innsendingsId}`)
      .reply(302, 'FOUND', { Location: SEND_LOCATION });
    const req = mockRequestWithPidAndTokenX({ headers: { AzureAccessToken: 'azure-access-token' }, body: defaultBody });
    const res = mockResponse();
    const next = vi.fn();
    await sendInnUtfyltSoknad.put(req, res, next);

    expect(res.sendStatus).toHaveBeenLastCalledWith(201);
    expect(res.header).toHaveBeenLastCalledWith({
      'Access-Control-Expose-Headers': 'Location',
      Location: SEND_LOCATION,
    });
    expect(next).not.toHaveBeenCalled();
    expect(globalTranslationsScope.isDone()).toBe(true);
    expect(formTranslationsScope.isDone()).toBe(true);
    expect(skjemabyggingproxyScope.isDone()).toBe(true);
    expect(sendInnNockScope.isDone()).toBe(true);
  });

  it('calls next if SendInn returns error', async () => {
    const skjemabyggingproxyScope = nock(process.env.FAMILIE_PDF_GENERATOR_URL!)
      .post('/api/pdf/v3/opprett-pdf')
      .reply(200, { content: encodedSoknadPdf }, { 'Content-Type': 'application/json' });
    const globalTranslationsScope = nock(formsApiUrl).get('/v1/global-translations').reply(200, []);
    const formTranslationsScope = nock(formsApiUrl).get('/v1/forms/default-form/translations').reply(200, []);
    const sendInnNockScope = nock(sendInnConfig.host)
      .put(`${sendInnConfig.paths.utfyltSoknad}/${innsendingsId}`)
      .reply(500, 'error body');
    const req = mockRequestWithPidAndTokenX({ body: defaultBody });
    const res = mockResponse();
    const next = vi.fn();
    await sendInnUtfyltSoknad.put(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error: any = next.mock.calls[0][0];
    expect(error.functional).toBe(true);
    expect(error.message).toBe('Feil ved kall til SendInn');
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(res.header).not.toHaveBeenCalled();
    expect(globalTranslationsScope.isDone()).toBe(true);
    expect(formTranslationsScope.isDone()).toBe(true);
    expect(skjemabyggingproxyScope.isDone()).toBe(true);
    expect(sendInnNockScope.isDone()).toBe(true);
  });

  it('calls next if exstream returns error', async () => {
    const skjemabyggingproxyScope = nock(process.env.FAMILIE_PDF_GENERATOR_URL!)
      .post('/api/pdf/v3/opprett-pdf')
      .reply(500, 'error body');
    const globalTranslationsScope = nock(formsApiUrl).get('/v1/global-translations').reply(200, []);
    const formTranslationsScope = nock(formsApiUrl).get('/v1/forms/default-form/translations').reply(200, []);
    const req = mockRequestWithPidAndTokenX({ body: defaultBody });
    const res = mockResponse();
    const next = vi.fn();
    await sendInnUtfyltSoknad.put(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error: any = next.mock.calls[0][0];
    expect(error.errorCode).toBe('INTERNAL_SERVER_ERROR');
    expect(error.message).toBe('Internal Server Error');
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(res.header).not.toHaveBeenCalled();
    expect(globalTranslationsScope.isDone()).toBe(true);
    expect(formTranslationsScope.isDone()).toBe(true);
    expect(skjemabyggingproxyScope.isDone()).toBe(true);
  });

  it('calls next with error if idporten pid is missing', async () => {
    const sendInnNockScope = nock(sendInnConfig.host)
      .put(`${sendInnConfig.paths.utfyltSoknad}/${innsendingsId}`)
      .reply(302, 'FOUND', { Location: SEND_LOCATION });
    const req = mockRequest({ body: defaultBody });
    req.getTokenxAccessToken = () => 'tokenx-access-token-for-unittest';
    const res = mockResponse();
    const next = vi.fn();
    await sendInnUtfyltSoknad.put(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error: any = next.mock.calls[0][0];
    expect(error.functional).toBeFalsy();
    expect(error.message).toBe('Missing idporten pid');
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(res.header).not.toHaveBeenCalled();
    expect(sendInnNockScope.isDone()).toBe(false);
  });

  it('calls next with error if tokenx access token is missing', async () => {
    const sendInnNockScope = nock(sendInnConfig.host)
      .put(`${sendInnConfig.paths.utfyltSoknad}/${innsendingsId}`)
      .reply(302, 'FOUND', { Location: SEND_LOCATION });
    const req = mockRequest({ headers: {}, body: defaultBody });
    req.getIdportenPid = () => '12345678911';
    const res = mockResponse();
    const next = vi.fn();
    await sendInnUtfyltSoknad.put(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error: any = next.mock.calls[0][0];
    expect(error.functional).toBeFalsy();
    expect(error.message).toBe('Missing TokenX access token');
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(res.header).not.toHaveBeenCalled();
    expect(sendInnNockScope.isDone()).toBe(false);
  });

  it('calls next with error if pdfFormData generation fails', async () => {
    const req = mockRequestWithPidAndTokenX({
      body: {
        ...defaultBody,
        form: undefined,
      },
    });
    const res = mockResponse();
    const next = vi.fn();

    await sendInnUtfyltSoknad.put(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error: any = next.mock.calls[0][0];
    expect(error).toBeDefined();
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(res.header).not.toHaveBeenCalled();
  });
});
