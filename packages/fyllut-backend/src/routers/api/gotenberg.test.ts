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

/*
const hexToString = hex => {
  let str = '';
  for (let i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}
*/

describe('gotenberg', () => {
  afterEach(() => {
    expect(nock.isDone()).toBe(true);
  });

  it('decodes and sends the pdf on success', async () => {
    //, 'Content-Disposition': 'attachment; filename=\"index.html\"'
    const url = config.gotenbergUrl;
    //const url = config.gotenbergUrl;
    const uri = '/forms/chromium/convert/html';

    console.log(`${url}${uri}`);
    const gotenbergScope = nock(`${url}` as string)
      .post(`${uri}`)
      .matchHeader('Content-Type', 'multipart/form-data')
      .reply(200, mockSuccessResponse);

    nock.recorder.rec();
    console.log(gotenbergScope.activeMocks());

    // Test
    try {
      const response = await fetch(`${url}${uri}`, {
        method: 'POST',
        //headers: { 'Accept': 'application/pdf, text/plain', 'Content-Type': 'multipart/form-data' },
        body: JSON.stringify(defaultBody),
      });
      console.log(response.status);
    } catch (e) {
      console.error(e);
    }
    // end test

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
