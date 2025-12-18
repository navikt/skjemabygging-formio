import { ForstesideRequestBody, forstesideUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { readFileSync } from 'fs';
import nock from 'nock';
import path from 'path';
import { config } from '../../config/config';
import { mockNext, mockRequest, mockResponse } from '../../test/requestTestHelpers';

import documents from '../../routers/api/documents/documents';

const { skjemabyggingProxyUrl, formsApiUrl, familiePdfGeneratorUrl, sendInnConfig } = config;

const formTitle = 'testskjema';
const filePathForsteside = path.join(process.cwd(), '/src/services/documents/testdata/test-forsteside.pdf');
const filePathSoknad = path.join(process.cwd(), '/src/services/documents/testdata/test-skjema.pdf');
const filePathMerged = path.join(process.cwd(), '/src/services/documents/testdata/test-merged.pdf');

describe('[endpoint] documents', () => {
  beforeAll(() => {
    vi.spyOn(forstesideUtils, 'genererFoerstesideData').mockImplementation(
      () =>
        ({
          foerstesidetype: 'ETTERSENDELSE',
          navSkjemaId: 'NAV 10.10.10',
          spraakkode: 'NB',
          overskriftstittel: 'Tittel',
          arkivtittel: 'Tittel',
          tema: 'HJE',
        }) as ForstesideRequestBody,
    );
  });

  it('Create front page and application', async () => {
    const forstesidePdf = readFileSync(filePathForsteside);
    const soknadPdf = readFileSync(filePathSoknad);
    const mergedPdf = readFileSync(filePathMerged);
    const encodedForstesidedPdf = forstesidePdf.toString('base64');
    const encodedSoknadPdf = soknadPdf.toString('base64');

    const mockAzureAccessTokenHandler = vi.fn((scope: string) => {
      return `mock-token-for:${scope}`;
    });
    const recipientsMock = nock(formsApiUrl).get('/v1/recipients').reply(200, []);
    const generateFileMock = nock(skjemabyggingProxyUrl!)
      .post('/foersteside')
      .reply(200, { foersteside: encodedForstesidedPdf });
    const skjemabyggingproxyScope = nock(familiePdfGeneratorUrl!)
      .post('/api/pdf/v3/opprett-pdf')
      .reply(200, encodedSoknadPdf);

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
    vi.spyOn(forstesideUtils, 'genererFoerstesideData').mockImplementation(
      () =>
        ({
          foerstesidetype: 'ETTERSENDELSE',
          navSkjemaId: 'NAV 10.10.10',
          spraakkode: 'en',
          overskriftstittel: 'Tittel',
          arkivtittel: 'Tittel',
          tema: 'HJE',
        }) as ForstesideRequestBody,
    );

    const forstesidePdf = readFileSync(filePathForsteside);
    const soknadPdf = readFileSync(filePathSoknad);
    const mergedPdf = readFileSync(filePathMerged);
    const encodedForstesidedPdf = forstesidePdf.toString('base64');
    const encodedSoknadPdf = soknadPdf.toString('base64');
    const mockAzureAccessTokenHandler = vi.fn((scope: string) => {
      return `mock-token-for:${scope}`;
    });

    const recipientsMock = nock(formsApiUrl).get('/v1/recipients').reply(200, []);
    const generateFileMock = nock(skjemabyggingProxyUrl!)
      .post('/foersteside')
      .reply(200, { foersteside: encodedForstesidedPdf });
    const skjemabyggingproxyScope = nock(familiePdfGeneratorUrl!)
      .post('/api/pdf/v3/opprett-pdf')
      .reply(200, encodedSoknadPdf);

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
});
