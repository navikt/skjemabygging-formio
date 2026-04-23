import nock from 'nock';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import { config } from './config/config';
import { createNologinToken, setupAzureTokenMocks, setupTokenMocks } from './test/integrationTestHelpers';
import { SubmitApplicationRequest, SubmitApplicationResponse } from './types/sendinn/sendinn';
import { base64Decode } from './utils/base64';

vi.mock('./dekorator', () => ({
  getDecorator: () => {},
  createRedirectUrl: () => '',
}));

const { sendInnConfig, familiePdfGeneratorUrl } = config;
const soknadPdf = Buffer.from('fake-pdf-content-for-tests');

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
      const applicationData = createApplicationData(formRevision);
      const submitResponse = createSubmitResponse(innsendingsId, applicationData.form.title);
      const tokenSetup = await setupTokens(innsendingsId);

      const pdfGeneratorScope = nock(familiePdfGeneratorUrl)
        .post('/api/pdf/v3/opprett-pdf')
        .matchHeader('authorization', `Bearer ${tokenSetup.azureAccessToken}`)
        .reply(200, soknadPdf);

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
      expectSuccessfulSubmitResponse(res.body, applicationData, submitResponse);

      expect(capturedRequestBody).toBeDefined();
      expectSubmitRequest(capturedRequestBody!, applicationData);
      expect(decodeMainDocumentAlt(capturedRequestBody!.mainDocumentAlt)).toEqual({
        language: 'nb',
        formRevision,
        data: applicationData.submission,
      });

      tokenSetup.assertDone();
      pdfGeneratorScope.done();
      sendInnScope.done();
    },
  );
});

const createApplicationData = (formRevision: number) => ({
  form: {
    components: [],
    path: 'nav123456',
    revision: formRevision,
    title: 'Application title',
    properties: { skjemanummer: 'NAV 12.34-56', tema: 'BIL' },
  },
  submission: { data: { fodselsnummerDNummerSoker: '12345678911', field: 'value' } },
  attachments: [],
  language: 'nb-NO',
  translation: {},
  pdfFormData: { label: 'Application title', verdiliste: [] },
});

const createSubmitResponse = (innsendingsId: string, title: string): SubmitApplicationResponse => ({
  innsendingsId,
  submittedAt: '2024-01-01T12:00:00.000Z',
  title,
  attachments: [],
});

type ApplicationData = ReturnType<typeof createApplicationData>;

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

const expectSuccessfulSubmitResponse = (
  responseBody: unknown,
  applicationData: ApplicationData,
  submitResponse: SubmitApplicationResponse,
) => {
  expect(responseBody).toEqual({
    pdfBase64: soknadPdf.toString('base64'),
    receipt: {
      title: applicationData.form.title,
      receivedDate: submitResponse.submittedAt,
      sendLaterDeadline: undefined,
      receivedAttachments: [],
      attachmentsToSendLater: [],
      attachmentsToBeSentByOthers: [],
    },
  });
};

const expectSubmitRequest = (requestBody: SubmitApplicationRequest, applicationData: ApplicationData) => {
  expect(requestBody).toMatchObject({
    bruker: '12345678911',
    formNumber: applicationData.form.properties.skjemanummer,
    title: applicationData.form.title,
    tema: applicationData.form.properties.tema,
    language: 'nb',
    mainDocument: soknadPdf.toString('base64'),
    attachments: [],
    otherUploadAvailable: false,
  });
};
