import { readFileSync } from 'fs';
import nock from 'nock';
import path from 'path';
import { config } from '../../../config/config';
import { mockNext, mockRequest, mockResponse } from '../../../test/requestTestHelpers';
import documents from './documents';

const { familiePdfGeneratorUrl, formsApiUrl, skjemabyggingProxyUrl, sendInnConfig } = config;

const formTitle = 'testskjema';
const filePathForsteside = path.join(process.cwd(), '/src/test/testdata/documents/test-forsteside.pdf');
const filePathSoknad = path.join(process.cwd(), '/src/test/testdata/documents/test-skjema.pdf');
const filePathMerged = path.join(process.cwd(), '/src/test/testdata/documents/test-merged.pdf');

describe('[endpoint] documents', () => {
  it('Create front page and application', async () => {
    const forstesidePdf = readFileSync(filePathForsteside);
    const soknadPdf = readFileSync(filePathSoknad);
    const mergedPdf = readFileSync(filePathMerged);
    const encodedForstesidedPdf = forstesidePdf.toString('base64');
    const encodedSoknadPdf = soknadPdf.toString('base64');

    const mockAzureAccessTokenHandler = vi.fn((scope: string) => {
      return `mock-token-for:${scope}`;
    });
    const recipientsMock = nock(formsApiUrl)
      .get('/v1/recipients/mottaksadresseId')
      .reply(200, { adresselinje1: 'Test' });
    const generateFileMock = nock(skjemabyggingProxyUrl!)
      .post('/foersteside')
      .reply(200, { foersteside: encodedForstesidedPdf });
    const skjemabyggingproxyScope = nock(familiePdfGeneratorUrl!)
      .post('/api/pdf/v3/opprett-pdf')
      .reply(200, { content: encodedSoknadPdf }, { 'Content-Type': 'application/json' });

    const mergePdfScope = nock(sendInnConfig.host!)
      .intercept('/fyllUt/v1/merge-filer', 'POST', (body) => {
        return body != null;
      })
      .reply(200, mergedPdf, { 'content-type': 'application/pdf' });

    const req = mockRequest({
      headers: {
        AzureAccessToken: mockAzureAccessTokenHandler('AzureAccessToken'),
        PdfAccessToken: mockAzureAccessTokenHandler('azurePdfGeneratorToken'),
        MergePdfToken: mockAzureAccessTokenHandler('azureMergePdfToken'),
      },
      body: {
        form: JSON.stringify({
          title: formTitle,
          components: [],
          properties: { mottaksadresseId: 'mottaksadresseId', path: '12345', skjemanummer: 'NAV 12.34-56' },
        }),
        submissionMethod: 'paper',
        language: 'nb-NO',
        submission: JSON.stringify({ data: {} }),
        translations: JSON.stringify({}),
      },
    });

    await documents.coverPageAndApplication(req, mockResponse(), mockNext());

    expect(recipientsMock.isDone()).toBe(true);
    expect(generateFileMock.isDone()).toBe(true);
    expect(skjemabyggingproxyScope.isDone()).toBe(true);
    expect(mergePdfScope.isDone()).toBe(true);
  }, 10000);

  it('Create front page and application  - english', async () => {
    const forstesidePdf = readFileSync(filePathForsteside);
    const soknadPdf = readFileSync(filePathSoknad);
    const mergedPdf = readFileSync(filePathMerged);
    const encodedForstesidedPdf = forstesidePdf.toString('base64');
    const encodedSoknadPdf = soknadPdf.toString('base64');
    const mockAzureAccessTokenHandler = vi.fn((scope: string) => {
      return `mock-token-for:${scope}`;
    });

    const recipientsMock = nock(formsApiUrl)
      .get('/v1/recipients/mottaksadresseId')
      .reply(200, { adresselinje1: 'Test' });
    const generateFileMock = nock(skjemabyggingProxyUrl!)
      .post('/foersteside')
      .reply(200, { foersteside: encodedForstesidedPdf });
    const skjemabyggingproxyScope = nock(familiePdfGeneratorUrl!)
      .post('/api/pdf/v3/opprett-pdf')
      .reply(200, { content: encodedSoknadPdf }, { 'Content-Type': 'application/json' });

    const mergePdfScope = nock(sendInnConfig.host!)
      .intercept('/fyllUt/v1/merge-filer', 'POST', (body) => {
        return body != null;
      })
      .reply(200, mergedPdf, { 'content-type': 'application/pdf' });

    const req = mockRequest({
      headers: {
        AzureAccessToken: mockAzureAccessTokenHandler('AzureAccessTokenToken'),
        PdfAccessToken: mockAzureAccessTokenHandler('azurePdfGeneratorToken'),
        MergePdfToken: mockAzureAccessTokenHandler('azureMergePdfToken'),
      },
      body: {
        form: JSON.stringify({
          title: formTitle,
          components: [],
          properties: { mottaksadresseId: 'mottaksadresseId', path: '12345', skjemanummer: 'NAV 12.34-56' },
        }),
        submissionMethod: 'paper',
        language: 'EN',
        submission: JSON.stringify({ data: {} }),
        translations: JSON.stringify({}),
      },
    });

    await documents.coverPageAndApplication(req, mockResponse(), mockNext());

    expect(recipientsMock.isDone()).toBe(true);
    expect(generateFileMock.isDone()).toBe(true);
    expect(skjemabyggingproxyScope.isDone()).toBe(true);
    expect(mergePdfScope.isDone()).toBe(true);
  }, 10000);

  it('fails if submission is missing in application endpoint', async () => {
    const req = mockRequest({
      headers: {
        PdfAccessToken: 'pdf-access-token',
      },
      body: {
        form: JSON.stringify({
          title: formTitle,
          components: [],
          properties: { mottaksadresseId: 'mottaksadresseId', path: '12345', skjemanummer: 'NAV 12.34-56' },
        }),
        language: 'nb-NO',
        translations: JSON.stringify({}),
      },
    });
    const next = vi.fn();

    await documents.application(req, mockResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Missing submission data to generate PDF' }));
  });
});
