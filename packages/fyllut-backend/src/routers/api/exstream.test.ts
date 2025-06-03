import nock from 'nock';
import path from 'path';
import { mockRequest, mockResponse } from '../../test/testHelpers';
import exstream from './exstream';

const formTitle = 'testskjema';
const defaultBody = {
  form: JSON.stringify({ title: formTitle, components: [], properties: { skjemanummer: 'NAV 12.34-56' } }),
  submission: JSON.stringify({ data: {} }),
  submissionMethod: 'paper',
  translations: JSON.stringify({}),
  language: 'nb-NO',
};

const filePathSoknad = path.join(process.cwd(), '/src/services/documents/testdata/test-skjema.pdf');

describe('exstream', () => {
  it('decodes and sends the pdf on success', async () => {
    const skjemabyggingproxyScope = nock(process.env.FAMILIE_PDF_GENERATOR_URL as string)
      .post('/api/pdf/v1/opprett-pdf')
      .reply(200, filePathSoknad, { 'content-type': 'application/pdf' });
    const req = mockRequest({ headers: { AzureAccessToken: 'azure-access-token' }, body: defaultBody });
    const res = mockResponse();
    const next = vi.fn();
    await exstream.post(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalled();
    skjemabyggingproxyScope.done();
  });

  it('calls next if skjemabygging-proxy returns error', async () => {
    const skjemabyggingproxyScope = nock(process.env.FAMILIE_PDF_GENERATOR_URL as string)
      .post('/api/pdf/v1/opprett-pdf')
      .reply(500, 'error body');
    const req = mockRequest({ headers: { AzureAccessToken: 'azure-access-token' }, body: defaultBody });
    const res = mockResponse();
    const next = vi.fn();
    await exstream.post(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error?.message).toBe('Generering av PDF feilet');
    expect(error?.render_html).toBe(true);
    expect(res.send).not.toHaveBeenCalled();
    skjemabyggingproxyScope.done();
  });
});
