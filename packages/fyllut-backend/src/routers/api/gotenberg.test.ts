import nock from 'nock';
import { config } from '../../config/config';
import { mockRequest, mockResponse } from '../../test/testHelpers';
import gotenberg from './gotenberg';

const formTitle = 'testskjema';
const defaultBody = {
  form: JSON.stringify({ title: formTitle, components: [], properties: { skjemanummer: 'NAV 12.34-56' } }),
  submission: JSON.stringify({ data: {} }),
  submissionMethod: 'paper',
  translations: JSON.stringify({}),
  language: 'nb-NO',
};
const mockSuccessResponse = new Uint8Array([37, 80, 68, 70, 45]); // A minimal valid PDF file header

describe('gotenberg', () => {
  afterEach(() => {
    expect(nock.isDone()).toBe(true);
  });

  it('decodes and sends the pdf on success', async () => {
    //TEST
    /*
    const { skjemabyggingProxyUrl } = config;
    const generateFileMock = nock(skjemabyggingProxyUrl!).post('/foersteside').reply(200, {});
    const req1 = mockRequest({
      headers: {
        AzureAccessToken: '',
        'Accept': 'application/pdf, text/plain'
      },
      body: {
        foerstesidetype: 'ETTERSENDELSE',
        navSkjemaId: 'NAV 10.10.10',
        spraakkode: 'NB',
        overskriftstittel: 'Tittel',
        arkivtittel: 'Tittel',
        tema: 'HJE',
      },
    });

    await forsteside.post(req1, mockResponse(), mockNext());

    expect(generateFileMock.isDone()).toBe(true);
*/

    //, 'Content-Disposition': 'attachment; filename=\"index.html\"'
    // , { 'accept': 'application/pdf, text/plain', 'content-type': 'multipart/form-data'}
    const url = config.gotenbergUrl;
    console.log(`${url}/forms/chromium/convert/html`);
    const gotenbergScope = nock(url!).post('/forms/chromium/convert/html').reply(200, mockSuccessResponse);

    /*
    const gotenbergScope = nock(url)
      .post('/forms/chromium/convert/html')
      .reply(200, 'mockSuccessResponse')
    ;
*/
    nock.recorder.rec();
    console.log(gotenbergScope.activeMocks());
    /*
 //TEST
    try {
      const response = await fetch(`${url}/forms/chromium/convert/html`, {
        method: 'POST',
        //body: JSON.stringify({data: 'test'}),
        //headers: { 'Accept': 'application/pdf, text/plain', 'Content-Type': 'multipart/form-data' },
      });
      console.log(response.status);
    } catch (e) {
      console.error(e);
    }
*/

    const req = mockRequest({ headers: {}, body: defaultBody });
    const res = mockResponse();
    const next = vi.fn();
    await gotenberg.post(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveReturned();
    gotenbergScope.done();
  });

  it('calls next if skjemabygging-proxy returns error', async () => {
    const url = config.gotenbergUrl;
    const gotenbergScope = nock(url).post('/forms/chromium/convert/html').reply(500, 'error body');
    const req = mockRequest({ headers: {}, body: defaultBody });
    const res = mockResponse();
    const next = vi.fn();
    await gotenberg.post(req, res, next);

    //expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error?.message).toBe('Generering av PDF feilet');
    expect(error?.render_html).toBe(true);
    expect(res.send).not.toHaveBeenCalled();
    gotenbergScope.done();
  });
});
