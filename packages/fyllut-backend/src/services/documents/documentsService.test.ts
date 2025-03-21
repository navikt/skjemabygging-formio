import { ForstesideRequestBody, forstesideUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { readFileSync } from 'fs';
import nock from 'nock';
import path from 'path';
import { config } from '../../config/config';
import { mockNext, mockRequest, mockResponse } from '../../test/requestTestHelpers';

import documents from '../../routers/api/documents/documents';
import * as mottaksadresser from '../../routers/api/mottaksadresser';

const { skjemabyggingProxyUrl, formsApiUrl } = config;

const addresses = [
  {
    _id: '6246de1afd03d2caeeda2825',
    data: {
      adresselinje1: 'Nav Arbeid og ytelser lønnsgaranti',
      adresselinje2: 'Postboks 6683 St. Olavs Plass',
      adresselinje3: '',
      postnummer: '0129',
      poststed: 'Oslo',
      temakoder: 'FOS,HJE',
    },
  },
  {
    _id: '61c09f91ec962a0003c65014',
    data: {
      adresselinje1: 'Nav Skanning bidrag',
      adresselinje2: 'PB 6215 Etterstad',
      adresselinje3: '',
      postnummer: '0603',
      poststed: 'Oslo',
    },
  },
];

const formTitle = 'testskjema';
const filePathForsteside = path.join(process.cwd(), '/src/services/documents/testdata/test-forsteside.pdf');
const filePathSoknad = path.join(process.cwd(), '/src/services/documents/testdata/test-skjema.pdf');
const filePathMerged = path.join(process.cwd(), '/src/services/documents/testdata/test-merged.pdf');

describe('[endpoint] documents', () => {
  beforeAll(() => {
    vi.spyOn(mottaksadresser, 'loadMottaksadresser').mockImplementation(async () => addresses);
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

    const recipientsMock = nock(formsApiUrl).get('/v1/recipients').reply(200, []);
    const generateFileMock = nock(skjemabyggingProxyUrl!)
      .post('/foersteside')
      .reply(200, { foersteside: encodedForstesidedPdf });
    const skjemabyggingproxyScope = nock(process.env.SKJEMABYGGING_PROXY_URL as string)
      .post('/exstream')
      .reply(200, { data: { result: [{ content: { data: encodedSoknadPdf } }] } });

    const mergePdfScope = nock(process.env.GOTENBERG_URL as string)
      .intercept('/forms/pdfengines/merge', 'POST', (body) => {
        return body != null;
      })
      .reply(200, mergedPdf, { 'content-type': 'application/pdf' });

    const req = mockRequest({
      headers: {
        AzureAccessToken: '',
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

    const recipientsMock = nock(formsApiUrl).get('/v1/recipients').reply(200, []);
    const generateFileMock = nock(skjemabyggingProxyUrl!)
      .post('/foersteside')
      .reply(200, { foersteside: encodedForstesidedPdf });
    const skjemabyggingproxyScope = nock(process.env.SKJEMABYGGING_PROXY_URL as string)
      .post('/exstream')
      .reply(200, { data: { result: [{ content: { data: encodedSoknadPdf } }] } });

    const mergePdfScope = nock(process.env.GOTENBERG_URL_EN as string)
      .intercept('/forms/pdfengines/merge', 'POST', (body) => {
        return body != null;
      })
      .reply(200, mergedPdf, { 'content-type': 'application/pdf' });

    const req = mockRequest({
      headers: {
        AzureAccessToken: '',
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
