import { Component, FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { readFileSync } from 'fs';
import nock from 'nock';
import path from 'path';
import { config } from '../../../config/config';
import { mockRequest, mockResponse } from '../../../test/requestTestHelpers';
import documents from './documents';

const { familiePdfGeneratorUrl, formsApiUrl, skjemabyggingProxyUrl, sendInnConfig } = config;

const formTitle = 'testskjema';
const filePathForsteside = path.join(process.cwd(), '/src/test/testdata/documents/test-forsteside.pdf');
const filePathSoknad = path.join(process.cwd(), '/src/test/testdata/documents/test-skjema.pdf');
const filePathMerged = path.join(process.cwd(), '/src/test/testdata/documents/test-merged.pdf');

describe('[endpoint] documents', () => {
  const mockForm = {
    skjemanummer: 'NAV 12.34-56',
    title: formTitle,
    path: 'testskjema',
    components: [{ type: 'container', key: 'yourInformation', label: 'Your information', yourInformation: true }],
    properties: { mottaksadresseId: 'mottaksadresseId', skjemanummer: 'NAV 12.34-56' },
  };

  const mockCoverPageAndApplication = ({
    form = mockForm,
    translations = [],
    assertCoverPageBody,
  }: {
    form?: Omit<typeof mockForm, 'components'> & { components: Component[] };
    translations?: FormsApiTranslation[];
    assertCoverPageBody?: (body: unknown) => void;
  } = {}) => {
    const formScope = nock(formsApiUrl).get('/v1/forms/testskjema').query(true).reply(200, form);
    const recipientsMock = nock(formsApiUrl)
      .get('/v1/recipients/mottaksadresseId')
      .reply(200, { adresselinje1: 'Test' });
    const globalTranslationsScope = nock(formsApiUrl).get('/v1/global-translations').query(true).reply(200, []);
    const formTranslationsScope = nock(formsApiUrl)
      .get('/v1/forms/testskjema/translations')
      .query(true)
      .reply(200, translations);
    const generateFileMock = nock(skjemabyggingProxyUrl!)
      .post('/foersteside', (body) => {
        assertCoverPageBody?.(body);
        return true;
      })
      .reply(200, { foersteside: readFileSync(filePathForsteside).toString('base64') });
    const skjemabyggingproxyScope = nock(familiePdfGeneratorUrl!)
      .post('/api/pdf/v3/opprett-pdf')
      .reply(200, { content: readFileSync(filePathSoknad).toString('base64') }, { 'Content-Type': 'application/json' });

    const mergePdfScope = nock(sendInnConfig.host!)
      .intercept('/fyllUt/v1/merge-filer', 'POST', (body) => {
        return body != null;
      })
      .reply(200, readFileSync(filePathMerged), { 'content-type': 'application/pdf' });

    return [
      formScope,
      recipientsMock,
      globalTranslationsScope,
      formTranslationsScope,
      generateFileMock,
      skjemabyggingproxyScope,
      mergePdfScope,
    ];
  };

  it.each(['nb', 'en'])('creates a cover page and application in %s', async (language) => {
    const scopes = mockCoverPageAndApplication();
    const req = mockRequest({
      headers: { AzureAccessToken: 'test', PdfAccessToken: 'test', MergePdfToken: 'test' },
      body: {
        formPath: 'testskjema',
        submissionMethod: 'paper',
        language,
        submission: JSON.stringify({
          data: {
            yourInformation: {
              fornavn: 'Test',
              etternavn: 'Testesen',
              adresse: { adresse: 'Testveien 1', postnummer: '0101', bySted: 'Oslo' },
            },
          },
        }),
      },
    });

    const next = vi.fn();
    await documents.coverPageAndApplication(req, mockResponse(), next);

    expect(next).not.toHaveBeenCalled();
    scopes.forEach((scope) => expect(scope.isDone()).toBe(true));
  });

  it.each([
    { name: 'explicit path', allowlist: ['testskjema'] },
    { name: 'wildcard', allowlist: ['*'] },
    { name: 'legacy renderer', allowlist: [] },
  ])('separates archival labels only for allowlisted forms ($name)', async ({ allowlist }) => {
    const previousNewRenderForms = config.newRenderForms;
    config.newRenderForms = allowlist;
    const newRenderer = allowlist.length > 0;
    try {
      const scopes = mockCoverPageAndApplication({
        form: {
          ...mockForm,
          components: [
            ...mockForm.components,
            ...['ordinary', 'other'].map((key): Component => ({
              key,
              navId: key,
              type: 'attachment',
              input: true,
              label: key,
              attachmentType: key === 'other' ? 'other' : 'default',
              properties: { vedleggskode: key },
            })),
          ],
        },
        translations: [
          { key: 'ordinary', en: 'Translated attachment' },
          { key: 'other', en: 'Other documentation' },
        ],
        assertCoverPageBody: (body) => {
          expect(body).toEqual(
            expect.objectContaining({
              vedleggsliste: newRenderer
                ? ['ordinary', 'My description']
                : ['Translated attachment', 'Other documentation'],
              dokumentlisteFoersteside: [
                `NAV 12.34-56 ${formTitle}`,
                'Translated attachment',
                newRenderer ? 'My description' : 'Other documentation',
              ],
            }),
          );
        },
      });
      const next = vi.fn();
      await documents.coverPageAndApplication(
        mockRequest({
          headers: { AzureAccessToken: 'test', PdfAccessToken: 'test', MergePdfToken: 'test' },
          body: {
            formPath: 'testskjema',
            language: 'en',
            submissionMethod: 'paper',
            submission: JSON.stringify({
              data: {
                ordinary: {
                  attachmentId: 'ordinary',
                  navId: 'ordinary',
                  type: 'default',
                  value: 'leggerVedNaa',
                },
                other: [
                  {
                    attachmentId: 'other',
                    navId: 'other',
                    type: 'other',
                    value: 'leggerVedNaa',
                    title: 'My description',
                  },
                ],
              },
            }),
          },
        }),
        mockResponse(),
        next,
      );
      expect(next).not.toHaveBeenCalled();
      scopes.forEach((scope) => expect(scope.isDone()).toBe(true));
    } finally {
      config.newRenderForms = previousNewRenderForms;
    }
  });

  it('fails if submission is missing in application endpoint', async () => {
    const req = mockRequest({
      headers: {
        PdfAccessToken: 'pdf-access-token',
      },
      body: {
        formPath: 'testskjema',
        language: 'nb',
      },
    });
    const next = vi.fn();

    await documents.application(req, mockResponse(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: 'BAD_REQUEST', message: 'Missing body value "submission"' }),
    );
  });
});
