import { SubmitApplicationRequest, SubmitApplicationResponse } from '@navikt/skjemadigitalisering-shared-backend';
import nock from 'nock';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import { config } from './config/config';
import { createNologinToken, setupAzureTokenMocks, setupTokenMocks } from './test/integrationTestHelpers';
import { base64Decode } from './utils/base64';

vi.mock('./dekorator', () => ({
  getDecorator: () => {},
  createRedirectUrl: () => '',
}));

const { sendInnConfig, familiePdfGeneratorUrl, formsApiUrl } = config;
const soknadPdf = Buffer.from('fake-pdf-content-for-tests');
const encodedSoknadPdf = soknadPdf.toString('base64');

const submitApplicationTestCases: SubmitApplicationTestCase[] = [
  {
    name: 'digital',
    innsendingsId: '65ed0008-ec72-4c90-8b44-165d3c265da0',
    formRevision: 37,
    route: '/fyllut/api/send-inn/digital-application/65ed0008-ec72-4c90-8b44-165d3c265da0',
    sendInnPath: '/v1/application-digital/65ed0008-ec72-4c90-8b44-165d3c265da0',
    setupTokens: async () => {
      const tokenSetup = await setupTokenMocks();
      return {
        azureAccessToken: tokenSetup.azureAccessToken,
        sendInnAccessToken: tokenSetup.tokenxAccessToken,
        headers: { Authorization: tokenSetup.authorizationHeader },
        assertDone: tokenSetup.assertDone,
      };
    },
  },
  {
    name: 'nologin',
    innsendingsId: '21ed0008-ec72-4c90-8b44-165d3c265da9',
    formRevision: 38,
    route: '/fyllut/api/send-inn/nologin-application',
    sendInnPath: '/v1/application-nologin/21ed0008-ec72-4c90-8b44-165d3c265da9',
    setupTokens: async (innsendingsId) => {
      const azureTokenSetup = setupAzureTokenMocks({ count: 2 });
      return {
        azureAccessToken: azureTokenSetup.azureAccessToken,
        sendInnAccessToken: azureTokenSetup.azureAccessToken,
        headers: { NologinToken: createNologinToken(innsendingsId) },
        assertDone: azureTokenSetup.assertDone,
      };
    },
  },
];

describe('Fyllut backend :: submit application', () => {
  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  it.each(submitApplicationTestCases)(
    'creates and submits the $name application request with formRevision in mainDocumentAlt',
    async ({ innsendingsId, formRevision, route, sendInnPath, setupTokens }) => {
      const applicationData = createApplicationData();
      const mockFormData = createMockFormData(formRevision);
      const submitResponse = createSubmitResponse(innsendingsId, mockFormData.title);
      const tokenSetup = await setupTokens(innsendingsId);

      const formScope = nock(formsApiUrl).get('/v1/forms/nav123456').query(true).reply(200, mockFormData);
      const pdfGeneratorScope = nock(familiePdfGeneratorUrl)
        .post('/api/pdf/v3/opprett-pdf')
        .matchHeader('authorization', `Bearer ${tokenSetup.azureAccessToken}`)
        .reply(200, { content: encodedSoknadPdf }, { 'Content-Type': 'application/json' });
      const globalTranslationsScope = nock(formsApiUrl).get('/v1/global-translations').query(true).reply(200, []);
      const formTranslationsScope = nock(formsApiUrl)
        .get('/v1/forms/nav123456/translations')
        .query(true)
        .reply(200, []);

      let capturedRequestBody: SubmitApplicationRequest | undefined;
      const sendInnScope = nock(sendInnConfig.host)
        .post(sendInnPath)
        .matchHeader('authorization', `Bearer ${tokenSetup.sendInnAccessToken}`)
        .matchHeader('x-innsendingsid', innsendingsId)
        .reply(200, (_uri, requestBody) => {
          capturedRequestBody = parseSubmitApplicationRequest(requestBody);
          return submitResponse;
        });

      const res = await request(createApp()).post(route).send(applicationData).set(tokenSetup.headers);
      expect(res.status).toBe(200);
      expectSuccessfulSubmitResponse(res.body, submitResponse);

      expect(capturedRequestBody).toBeDefined();
      expectSubmitRequest(capturedRequestBody!);
      expect(decodeMainDocumentAlt(capturedRequestBody!.mainDocumentAlt)).toEqual({
        language: 'nb',
        formRevision,
        data: applicationData.submission,
      });

      tokenSetup.assertDone();
      formScope.done();
      globalTranslationsScope.done();
      formTranslationsScope.done();
      pdfGeneratorScope.done();
      sendInnScope.done();
    },
  );
});

const createMockFormData = (revision: number) => ({
  skjemanummer: 'NAV 12.34-56',
  title: 'Application title',
  path: 'nav123456',
  revision,
  properties: { skjemanummer: 'NAV 12.34-56', tema: 'BIL' },
  components: [],
});

const createApplicationData = () => ({
  formPath: 'nav123456',
  submission: { data: { fodselsnummerDNummerSoker: '12345678911', field: 'value' } },
  attachments: [],
  language: 'nb',
});

const createSubmitResponse = (innsendingsId: string, title: string): SubmitApplicationResponse => ({
  innsendingsId,
  submittedAt: '2024-01-01T12:00:00.000Z',
  title,
  attachments: [],
});

type TokenSetupResult = {
  azureAccessToken: string;
  sendInnAccessToken: string;
  headers: Record<string, string>;
  assertDone: () => void;
};

type SubmitApplicationTestCase = {
  name: string;
  innsendingsId: string;
  formRevision: number;
  route: string;
  sendInnPath: string;
  setupTokens: (innsendingsId: string) => Promise<TokenSetupResult>;
};

const parseSubmitApplicationRequest = (requestBody: string | Buffer | object): SubmitApplicationRequest =>
  typeof requestBody === 'string'
    ? (JSON.parse(requestBody) as SubmitApplicationRequest)
    : (requestBody as SubmitApplicationRequest);

const decodeMainDocumentAlt = (mainDocumentAlt: string) =>
  JSON.parse(base64Decode(mainDocumentAlt)?.toString('utf-8') ?? '{}');

const expectSuccessfulSubmitResponse = (responseBody: unknown, submitResponse: SubmitApplicationResponse) => {
  expect(responseBody).toEqual({
    pdfBase64: soknadPdf.toString('base64'),
    receipt: {
      title: 'Application title',
      receivedDate: submitResponse.submittedAt,
      sendLaterDeadline: undefined,
      receivedAttachments: [],
      attachmentsToSendLater: [],
      attachmentsToBeSentByOthers: [],
    },
  });
};

const expectSubmitRequest = (requestBody: SubmitApplicationRequest) => {
  expect(requestBody).toMatchObject({
    bruker: '12345678911',
    formNumber: 'NAV 12.34-56',
    title: 'Application title',
    tema: 'BIL',
    language: 'nb',
    mainDocument: soknadPdf.toString('base64'),
    attachments: [],
    otherUploadAvailable: false,
  });
};
