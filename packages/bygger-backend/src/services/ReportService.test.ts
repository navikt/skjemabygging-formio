import {
  Component,
  ComponentProperties,
  DeclarationType,
  Form,
  FormPropertiesType,
  PublishedTranslations,
  Recipient,
  SubmissionType,
} from '@navikt/skjemadigitalisering-shared-domain';
import MemoryStream from 'memorystream';
import nock from 'nock';
import config from '../config';
import ReportService from './ReportService';
import { formPublicationsService, formsService, recipientService, staticPdfService } from './index';

const { formsApi } = config;

describe('ReportService', () => {
  let reportService: ReportService;

  beforeEach(() => {
    reportService = new ReportService({ formsService, formPublicationsService, recipientService, staticPdfService });
  });

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  it('returns list containing report metadata', () => {
    const allReports = reportService.getAllReports();
    const report = allReports.find((report) => report.id === 'forms-published-languages');
    expect(report).toBeDefined();
    expect(report?.title).toBe('Publiserte språk per skjema');
    expect(report?.contentType).toBe('text/csv');
    expect(report?.fileExtension).toBe('csv');
  });

  describe('getReportDefinition', () => {
    it('returns report definition for given id', () => {
      const reportDefinition = reportService.getReportDefinition('forms-published-languages');
      expect(reportDefinition).toBeDefined();
      expect(reportDefinition?.title).toBe('Publiserte språk per skjema');
    });

    it('returns undefined when id is unknown', () => {
      const reportDefinition = reportService.getReportDefinition('unknown-report-id');
      expect(reportDefinition).toBeUndefined();
    });
  });

  describe('Reports', () => {
    const CSV_HEADER_LINE =
      '\uFEFFskjemanummer;språk;skjematittel (nb);skjematittel (nn);skjematittel (en);submissionTypes;radnummer\n';

    const createWritableStream = () => new MemoryStream(undefined, { readable: false });

    const setupNock = (
      publishedForms: Partial<Form>[],
      recipients: Recipient[] = [],
      formsWithUploadedPdfs: string[] = [],
    ) => {
      nock(formsApi.url).get('/v1/recipients').reply(200, recipients);
      nock(formsApi.url)
        .get(/\/v1\/forms\?.*$/)
        .times(1)
        .reply(200, publishedForms);
      nock(formsApi.url)
        .get(/\/v1\/form-publications$/)
        .times(1)
        .reply(200, publishedForms);
      for (const form of publishedForms) {
        nock(formsApi.url).get(`/v1/form-publications/${form.path}`).reply(200, form);
        nock(formsApi.url)
          .get(`/v1/forms/${form.path}/static-pdfs`)
          .reply(
            200,
            formsWithUploadedPdfs.includes(form.path ?? '')
              ? [{ id: 1, languageCode: 'nb', fileName: 'example.pdf' }]
              : [],
          );
        nock(formsApi.url).get(`/v1/forms/${form.path}`).reply(200, form);
        const publishedTranslations: PublishedTranslations = {
          publishedAt: form.publishedAt ?? '2025-01-28T10:00:10.325Z',
          publishedBy: 'TEST',
          translations:
            form.publishedLanguages?.reduce((acc, cur) => {
              return {
                ...acc,
                [cur]: {},
              };
            }, {}) || {},
        };
        nock(formsApi.url)
          .get(/\/v1\/form-publications\/(.+)\/translations\?.*/)
          .times(1)
          .reply(200, publishedTranslations);
      }
    };

    function parseReport(content: string) {
      const allLines = content.split('\n').filter((line) => !!line);
      const forms = allLines.slice(1).map((formLine) => formLine.split(';'));
      const headers = allLines[0].replace(/^\uFEFF/, '').split(';');
      return {
        headers,
        forms,
        numberOfForms: forms.length,
        getHeaderIndex: (overskrift: string) => headers.indexOf(overskrift),
      };
    }

    describe('generateFormsPublishedLanguage', () => {
      describe('PDF forms', () => {
        it('reports uploaded PDFs and STATIC_PDF independently as yes or blank', async () => {
          const createForm = (path: string, submissionTypes: FormPropertiesType['submissionTypes'] = []): Form => ({
            title: path,
            components: [],
            skjemanummer: path,
            path,
            properties: {
              skjemanummer: path,
              submissionTypes,
              subsequentSubmissionTypes: [],
            } as unknown as FormPropertiesType,
          });
          const publishedForms = [
            createForm('uploaded-only'),
            createForm('enabled-only', ['STATIC_PDF']),
            createForm('both', ['STATIC_PDF']),
            createForm('neither'),
          ];
          setupNock(publishedForms, [], ['uploaded-only', 'both']);

          const writableStream = createWritableStream();
          await reportService.generate('all-forms-summary', writableStream);
          const report = parseReport(writableStream.toString());
          const pathIndex = report.getHeaderIndex('path');
          const uploadedPdfIndex = report.getHeaderIndex('har opplastede PDF-er');
          const staticPdfEnabledIndex = report.getHeaderIndex('STATIC_PDF aktivert');
          const staticPdfSubsequentSubmissionUrlIndex = report.getHeaderIndex('ettersendingsurl (static PDF)');

          expect(
            report.forms.map((row) => [row[pathIndex], row[uploadedPdfIndex], row[staticPdfEnabledIndex]]),
          ).toEqual([
            ['uploaded-only', 'ja', ''],
            ['enabled-only', '', 'ja'],
            ['both', 'ja', 'ja'],
            ['neither', '', ''],
          ]);
          expect(report.forms[1][staticPdfSubsequentSubmissionUrlIndex]).toBe('');
        });
      });

      describe('nologin submission URL', () => {
        it('reports the URL only for forms that support nologin submission', async () => {
          const publishedForms = [
            {
              title: 'Nologin form',
              components: [],
              skjemanummer: 'TEST1',
              path: 'nologin-form',
              properties: {
                skjemanummer: 'TEST1',
                submissionTypes: ['DIGITAL_NO_LOGIN'],
                subsequentSubmissionTypes: [],
              } as unknown as FormPropertiesType,
            },
            {
              title: 'Digital form',
              components: [],
              skjemanummer: 'TEST2',
              path: 'digital-form',
              properties: {
                skjemanummer: 'TEST2',
                submissionTypes: ['DIGITAL'],
                subsequentSubmissionTypes: [],
              } as unknown as FormPropertiesType,
            },
          ];
          setupNock(publishedForms);

          const writableStream = createWritableStream();
          await reportService.generate('all-forms-summary', writableStream);
          const report = parseReport(writableStream.toString());
          const noLoginUrlIndex = report.getHeaderIndex('innsendingsurl (nologin)');

          expect(report.forms[0][noLoginUrlIndex]).toBe(
            'https://fyllut-preprod.intern.dev.nav.no/fyllut/nologin-form?sub=digitalnologin',
          );
          expect(report.forms[1][noLoginUrlIndex]).toBe('');
        });
      });

      describe('intro page', () => {
        it('reports the intro page as yes or blank', async () => {
          const publishedForms: Form[] = [true, false, undefined].map((enabled, index) => ({
            title: 'Intro page',
            components: [],
            skjemanummer: 'EXAMPLE',
            path: `intro-page-${index}`,
            introPage:
              enabled === undefined
                ? undefined
                : { enabled, introduction: '', selfDeclaration: '', sections: { prerequisites: {} } },
            properties: {
              skjemanummer: 'EXAMPLE',
              tema: 'TEST',
              submissionTypes: [],
              subsequentSubmissionTypes: [],
            },
          }));
          setupNock(publishedForms);

          const writableStream = createWritableStream();
          await reportService.generate('all-forms-summary', writableStream);
          const report = parseReport(writableStream.toString());
          const introPageEnabledIndex = report.getHeaderIndex('introside aktivert');

          expect(report.forms.map((row) => row[introPageEnabledIndex])).toEqual(['ja', '', '']);
        });
      });

      describe('recipient address', () => {
        it('leaves the standard recipient blank and reports selected recipient addresses', async () => {
          const publishedForms = [
            {
              title: 'Standard recipient',
              components: [],
              skjemanummer: 'TEST1',
              path: 'standard-recipient',
              properties: {
                skjemanummer: 'TEST1',
                submissionTypes: [],
                subsequentSubmissionTypes: [],
              } as unknown as FormPropertiesType,
            },
            {
              title: 'Selected recipient',
              components: [],
              skjemanummer: 'TEST2',
              path: 'selected-recipient',
              properties: {
                skjemanummer: 'TEST2',
                mottaksadresseId: 'recipient',
                submissionTypes: [],
                subsequentSubmissionTypes: [],
              } as unknown as FormPropertiesType,
            },
          ];
          setupNock(publishedForms, [
            {
              recipientId: 'recipient',
              name: 'Example office',
              poBoxAddress: 'Postboks 123',
              postalCode: '0123',
              postalName: 'Oslo',
            },
          ]);

          const writableStream = createWritableStream();
          await reportService.generate('all-forms-summary', writableStream);
          const report = parseReport(writableStream.toString());
          const recipientAddressIndex = report.getHeaderIndex('mottaksadresse');

          expect(report.forms[0][recipientAddressIndex]).toBe('');
          expect(report.forms[1][recipientAddressIndex]).toBe('Example office, Postboks 123, 0123 Oslo');
        });
      });

      it('reports the paper unit requirement as yes or blank', async () => {
        const forms: Form[] = [true, false, undefined].map((requiresUnit, index) => ({
          title: 'Paper unit requirement',
          skjemanummer: 'EXAMPLE',
          path: `paper-unit-${index}`,
          properties: {
            skjemanummer: 'EXAMPLE',
            tema: 'TEST',
            submissionTypes: ['PAPER'],
            subsequentSubmissionTypes: [],
            enhetMaVelgesVedPapirInnsending: requiresUnit,
          },
          components: [],
        }));
        setupNock(forms);
        const writableStream = createWritableStream();
        await reportService.generate('all-forms-summary', writableStream);
        const report = parseReport(writableStream.toString());

        expect(report.forms.map((row) => row[report.getHeaderIndex('må velge enhet (papir)')])).toEqual(['ja', '', '']);
      });

      it('reports general instructions as yes or blank', async () => {
        const forms: Form[] = ['General instructions', '', ' \t ', undefined].map((instructions, index) => ({
          title: 'General instructions',
          skjemanummer: 'EXAMPLE',
          path: `general-instructions-${index}`,
          properties: {
            skjemanummer: 'EXAMPLE',
            tema: 'TEST',
            submissionTypes: ['PAPER'],
            subsequentSubmissionTypes: [],
            descriptionOfSignatures: instructions,
          },
          components: [],
        }));
        setupNock(forms);
        const writableStream = createWritableStream();
        await reportService.generate('all-forms-summary', writableStream);
        const report = parseReport(writableStream.toString());

        expect(report.forms.map((row) => row[report.getHeaderIndex('generelle instruksjoner')])).toEqual([
          'ja',
          '',
          '',
          '',
        ]);
      });

      it.each<{
        name: string;
        signatures: FormPropertiesType['signatures'];
        expected: string;
      }>([
        { name: 'missing signatures', signatures: undefined, expected: '' },
        { name: 'empty signature list', signatures: [], expected: '' },
        {
          name: 'default signature',
          signatures: [{ label: '', description: '', key: 'default' }],
          expected: '',
        },
        {
          name: 'instructions without a signer label',
          signatures: [{ label: ' \t ', description: 'Sign here', key: 'instructions' }],
          expected: '',
        },
        {
          name: 'one custom signer',
          signatures: [{ label: ' Doctor ', description: 'Medical confirmation', key: 'doctor' }],
          expected: 'Doctor',
        },
        {
          name: 'multiple signers with an empty label between them',
          signatures: [
            { label: ' Doctor ', description: '', key: 'doctor' },
            { label: ' \t ', description: '', key: 'default' },
            { label: ' Applicant ', description: '', key: 'applicant' },
          ],
          expected: 'Doctor, Applicant',
        },
        { name: 'legacy default signatures', signatures: {}, expected: '' },
        {
          name: 'legacy custom signers',
          signatures: {
            signature1: ' Doctor ',
            signature1Description: 'Medical confirmation',
            signature2: ' ',
            signature3: 'Applicant',
          },
          expected: 'Doctor, Applicant',
        },
      ])('reports who signs for $name', async ({ signatures, expected }) => {
        const form: Form = {
          title: 'Signer labels',
          skjemanummer: 'EXAMPLE',
          path: 'signer-labels',
          properties: {
            skjemanummer: 'EXAMPLE',
            tema: 'TEST',
            submissionTypes: ['PAPER'],
            subsequentSubmissionTypes: [],
            signatures,
          },
          components: [],
        };
        setupNock([form]);
        const writableStream = createWritableStream();
        await reportService.generate('all-forms-summary', writableStream);
        const report = parseReport(writableStream.toString());

        expect(report.headers.slice(report.getHeaderIndex('signaturfelt'), report.getHeaderIndex('path'))).toEqual([
          'signaturfelt',
          'hvem signerer, hvis ikke standard',
        ]);
        expect(report.forms).toHaveLength(1);
        expect(report.forms[0][report.getHeaderIndex('hvem signerer, hvis ikke standard')]).toBe(expected);
      });

      describe('number of signatures', () => {
        const HEADER_SIGNATURES = 'signaturfelt';

        it('defaults to 1 signature', async () => {
          const publishedForms = [
            {
              title: 'Testskjema1',
              components: [],
              skjemanummer: 'TEST1',
              path: 'test1',
              properties: {
                skjemanummer: 'TEST1',
                signatures: undefined,
                submissionTypes: [],
                subsequentSubmissionTypes: [],
              } as unknown as FormPropertiesType,
            },
          ];
          setupNock(publishedForms);
          const writableStream = createWritableStream();
          await reportService.generate('all-forms-summary', writableStream);
          const report = parseReport(writableStream.toString());
          expect(report.numberOfForms).toBe(1);
          const formFields = report.forms[0];
          expect(formFields[report.getHeaderIndex(HEADER_SIGNATURES)]).toBe('1');
        });

        it('signature array with default signature', async () => {
          const publishedForms = [
            {
              title: 'Testskjema1',
              components: [],
              skjemanummer: 'TEST1',
              path: 'test1',
              properties: {
                skjemanummer: 'TEST1',
                signatures: [{ label: '' }],
                submissionTypes: [],
                subsequentSubmissionTypes: [],
              } as unknown as FormPropertiesType,
            },
          ];
          setupNock(publishedForms);
          const writableStream = createWritableStream();
          await reportService.generate('all-forms-summary', writableStream);
          const report = parseReport(writableStream.toString());
          expect(report.numberOfForms).toBe(1);
          const formFields = report.forms[0];
          expect(formFields[report.getHeaderIndex(HEADER_SIGNATURES)]).toBe('1');
        });

        it('has 3 signatures', async () => {
          const publishedForms = [
            {
              title: 'Testskjema1',
              components: [],
              skjemanummer: 'TEST1',
              path: 'test1',
              properties: {
                skjemanummer: 'TEST1',
                signatures: [{ label: 'Lege' }, { label: 'Verge' }, { label: 'Søker' }],
                submissionTypes: [],
                subsequentSubmissionTypes: [],
              } as unknown as FormPropertiesType,
            },
          ];
          setupNock(publishedForms);
          const writableStream = createWritableStream();
          await reportService.generate('all-forms-summary', writableStream);
          const report = parseReport(writableStream.toString());
          expect(report.numberOfForms).toBe(1);
          const formFields = report.forms[0];
          expect(formFields[report.getHeaderIndex(HEADER_SIGNATURES)]).toBe('3');
        });
      });

      describe('unpublished changes', () => {
        const HEADER_UNPUBLISHED_CHANGES = 'upubliserte endringer';

        it('has no unpublished changes', async () => {
          const publishedForms = [
            {
              title: 'Testskjema1',
              components: [],
              skjemanummer: 'TEST1',
              path: 'test1',
              changedAt: '2022-07-28T10:00:10.325Z',
              publishedAt: '2022-07-28T10:00:10.325Z',
              status: 'published',
              properties: {
                skjemanummer: 'TEST1',
                published: '2022-07-28T10:00:10.325Z',
                modified: '2022-07-28T10:00:10.325Z',
                submissionTypes: [],
                subsequentSubmissionTypes: [],
              } as unknown as FormPropertiesType,
            } as Form,
          ];
          setupNock(publishedForms);
          const writableStream = createWritableStream();
          await reportService.generate('all-forms-summary', writableStream);
          const report = parseReport(writableStream.toString());
          expect(report.numberOfForms).toBe(1);
          const formFields = report.forms[0];
          expect(formFields[report.getHeaderIndex(HEADER_UNPUBLISHED_CHANGES)]).toBe('nei');
        });

        it('has unpublished changes', async () => {
          const publishedForms = [
            {
              title: 'Testskjema1',
              components: [],
              skjemanummer: 'TEST1',
              path: 'test1',
              changedAt: '2022-07-28T11:00:05.254Z',
              publishedAt: '2022-07-28T10:00:10.325Z',
              status: 'pending',
              properties: {
                skjemanummer: 'TEST1',
                published: '2022-07-28T10:00:10.325Z',
                modified: '2022-07-28T11:00:05.254Z',
                submissionTypes: [],
                subsequentSubmissionTypes: [],
              } as unknown as FormPropertiesType,
            } as Form,
          ];
          setupNock(publishedForms);
          const writableStream = createWritableStream();
          await reportService.generate('all-forms-summary', writableStream);
          const report = parseReport(writableStream.toString());
          expect(report.numberOfForms).toBe(1);
          const formFields = report.forms[0];
          expect(formFields[report.getHeaderIndex(HEADER_UNPUBLISHED_CHANGES)]).toBe('ja');
        });

        it('shows no information about unpublished changes for unpublished forms', async () => {
          const publishedForms = [
            {
              title: 'Testskjema1',
              components: [],
              skjemanummer: 'TEST1',
              path: 'test1',
              changedAt: '2022-07-28T11:00:05.254Z',
              status: 'draft',
              properties: {
                skjemanummer: 'TEST1',
                modified: '2022-07-28T11:00:05.254Z',
                submissionTypes: [],
                subsequentSubmissionTypes: [],
              } as unknown as FormPropertiesType,
            } as Form,
          ];
          setupNock(publishedForms);
          const writableStream = createWritableStream();
          await reportService.generate('all-forms-summary', writableStream);
          const report = parseReport(writableStream.toString());
          expect(report.numberOfForms).toBe(1);
          const formFields = report.forms[0];
          expect(formFields[report.getHeaderIndex(HEADER_UNPUBLISHED_CHANGES)]).toBe('');
        });
      });
    });

    describe('generateAllFormsSummary', () => {
      it('includes published forms with their languages and submission types', async () => {
        const publishedForms = [
          {
            title: 'Testskjema1',
            components: [],
            skjemanummer: 'TEST1',
            path: 'test1',
            publishedAt: '2022-07-28T10:00:10.325Z',
            publishedLanguages: ['nb', 'en', 'nn'],
            status: 'published',
            properties: {
              skjemanummer: 'TEST1',
              submissionTypes: ['DIGITAL', 'PAPER'],
            } as unknown as FormPropertiesType,
          } as Form,
          {
            title: 'Testskjema2',
            components: [],
            skjemanummer: 'TEST2',
            path: 'test2',
            publishedAt: '2022-07-28T10:00:10.325Z',
            publishedLanguages: ['nb', 'en'],
            status: 'published',
            properties: {
              skjemanummer: 'TEST2',
              submissionTypes: ['STATIC_PDF'],
            } as unknown as FormPropertiesType,
          } as Form,
          {
            title: 'Testskjema3',
            components: [],
            skjemanummer: 'TEST3',
            path: 'test3',
            publishedAt: '2022-07-28T10:00:10.325Z',
            publishedLanguages: ['nb'],
            status: 'published',
            properties: {
              submissionTypes: [],
            } as unknown as FormPropertiesType,
          } as Form,
        ];
        setupNock(publishedForms);

        const writableStream = createWritableStream();
        await reportService.generate('forms-published-languages', writableStream);
        expect(writableStream.toString()).toEqual(
          CSV_HEADER_LINE +
            'TEST1;nb, en, nn;Testskjema1;Testskjema1;Testskjema1;"[""DIGITAL"", ""PAPER""]";1\n' +
            'TEST2;nb, en;Testskjema2;;Testskjema2;"[""STATIC_PDF""]";2\n' +
            'TEST3;nb;Testskjema3;;;[];3\n',
        );
      });

      it('uses the published title when reporting translated titles', async () => {
        const draft = {
          title: 'Draft title',
          components: [],
          skjemanummer: 'TEST1',
          path: 'test1',
          status: 'pending',
          properties: {
            skjemanummer: 'TEST1',
            submissionTypes: ['STATIC_PDF'],
            subsequentSubmissionTypes: [],
          } as unknown as FormPropertiesType,
        };
        const published = {
          ...draft,
          title: 'Published title',
          status: 'published',
          properties: {
            ...draft.properties,
            submissionTypes: ['DIGITAL', 'PAPER'],
          },
        };
        const translations: PublishedTranslations = {
          publishedAt: '2025-01-28T10:00:10.325Z',
          publishedBy: 'TEST',
          translations: {
            nb: {},
            en: { 'Published title': 'English title' },
          },
        };
        const api = nock(formsApi.url)
          .get('/v1/form-publications')
          .reply(200, [draft])
          .get('/v1/form-publications/test1')
          .reply(200, published)
          .get('/v1/form-publications/test1/translations')
          .query({ languageCodes: 'nb,nn,en' })
          .reply(200, translations);

        const writableStream = createWritableStream();
        await reportService.generate('forms-published-languages', writableStream);

        expect(writableStream.toString()).toEqual(
          CSV_HEADER_LINE + 'TEST1;nb, en;Published title;;English title;"[""DIGITAL"", ""PAPER""]";1\n',
        );
        expect(api.isDone()).toBe(true);
      });

      it('excludes drafts, unpublished forms and test forms marked in either version', async () => {
        const createForm = (path: string, status: Form['status'] = 'published'): Form => ({
          path,
          skjemanummer: path,
          title: path,
          status,
          properties: {
            skjemanummer: path,
            tema: 'TEST',
            submissionTypes: ['DIGITAL'],
            subsequentSubmissionTypes: [],
          },
          components: [],
        });
        const published = createForm('published');
        const pending = createForm('pending', 'pending');
        const draft = createForm('draft', 'draft');
        const unpublished = createForm('unpublished', 'unpublished');
        const markedInList = createForm('rune-test');
        markedInList.title = 'Rune test';
        markedInList.properties.isTestForm = true;
        const markedInSnapshot = createForm('magnus-test');
        markedInSnapshot.title = 'Magnus test';
        const snapshot = {
          ...markedInSnapshot,
          properties: { ...markedInSnapshot.properties, isTestForm: true },
        };
        const legitimate = createForm('allergitest');
        const api = nock(formsApi.url)
          .get('/v1/form-publications')
          .reply(200, [published, pending, draft, unpublished, markedInList, markedInSnapshot, legitimate])
          .get('/v1/form-publications/published')
          .reply(200, published)
          .get('/v1/form-publications/pending')
          .reply(200, { ...pending, status: 'published' })
          .get('/v1/form-publications/magnus-test')
          .reply(200, snapshot)
          .get('/v1/form-publications/allergitest')
          .reply(200, legitimate);
        for (const path of ['published', 'pending', 'allergitest']) {
          api
            .get(`/v1/form-publications/${path}/translations`)
            .query({ languageCodes: 'nb,nn,en' })
            .reply(200, {
              publishedAt: '2025-01-01',
              publishedBy: 'TEST',
              translations: { nb: {} },
            });
        }

        const writableStream = createWritableStream();
        await reportService.generate('forms-published-languages', writableStream);
        const report = parseReport(writableStream.toString());

        expect(report.forms.map((row) => [row[0], row.at(-1)])).toEqual([
          ['published', '1'],
          ['pending', '2'],
          ['allergitest', '3'],
        ]);
        expect(api.isDone()).toBe(true);
      });

      it.each(['draft', 'unpublished', 'pending'] as const)(
        'does not report a %s snapshot as published',
        async (status) => {
          const form: Form = {
            path: 'not-published',
            skjemanummer: 'EXAMPLE',
            title: 'Not published',
            status: 'published',
            properties: {
              skjemanummer: 'EXAMPLE',
              tema: 'TEST',
              submissionTypes: [],
              subsequentSubmissionTypes: [],
            },
            components: [],
          };
          const api = nock(formsApi.url)
            .get('/v1/form-publications')
            .reply(200, [form])
            .get('/v1/form-publications/not-published')
            .reply(200, { ...form, status });
          const writableStream = createWritableStream();
          await reportService.generate('forms-published-languages', writableStream);

          expect(writableStream.toString()).toBe(CSV_HEADER_LINE);
          expect(api.isDone()).toBe(true);
        },
      );

      it('has correct attachment fields', async () => {
        const HEADER_NUMBER_OF_ATTACHMENTS = 'antall vedlegg';
        const HEADER_ATTACHMENT_NAMES = 'vedleggsnavn';

        const publishedForms = [
          {
            title: 'Testskjema1',
            skjemanummer: 'TEST1',
            path: 'test1',
            status: 'published',
            components: [
              {
                type: 'panel',
                isAttachmentPanel: true,
                title: 'Vedlegg',
                components: [
                  {
                    type: 'attachment',
                    properties: {
                      vedleggstittel: 'Annet',
                      vedleggskode: 'N6',
                    } as ComponentProperties,
                  },
                  {
                    type: 'attachment',
                    properties: {
                      vedleggstittel: 'Uttalelse fra fagpersonell',
                      vedleggskode: 'L8',
                    } as ComponentProperties,
                  },
                ] as Component[],
              },
            ] as Component[],
            properties: {
              submissionTypes: [],
              subsequentSubmissionTypes: [],
            } as unknown as FormPropertiesType,
          } as Form,
          {
            title: 'Testskjema2',
            components: [],
            skjemanummer: 'TEST2',
            path: 'test2',
            status: 'published',
            properties: {
              submissionTypes: [],
              subsequentSubmissionTypes: [],
            } as unknown as FormPropertiesType,
          } as Form,
          {
            title: 'Testskjema3',
            skjemanummer: 'TEST3',
            path: 'test3',
            status: 'published',
            components: [
              {
                type: 'panel',
                isAttachmentPanel: true,
                title: 'Vedlegg',
                components: [] as Component[],
              },
            ] as Component[],
            properties: {
              submissionTypes: [],
              subsequentSubmissionTypes: [],
            } as unknown as FormPropertiesType,
          } as Form,
        ];
        setupNock(publishedForms);

        const writableStream = createWritableStream();
        await reportService.generate('all-forms-summary', writableStream);
        const report = parseReport(writableStream.toString());
        expect(report.numberOfForms).toBe(3);
        expect(report.headers).not.toContain('har vedlegg');
        expect(report.forms.every((row) => row.length === report.headers.length)).toBe(true);
        expect(report.headers.at(-1)).toBe('radnummer');
        expect(report.forms.map((row) => row.at(-1))).toEqual(['1', '2', '3']);

        const formFields1 = report.forms[0];
        const formFields2 = report.forms[1];
        const formFields3 = report.forms[2];

        expect(formFields1[report.getHeaderIndex(HEADER_NUMBER_OF_ATTACHMENTS)]).toBe('2'); // has attachments
        expect(formFields2[report.getHeaderIndex(HEADER_NUMBER_OF_ATTACHMENTS)]).toBe('0'); // no components
        expect(formFields3[report.getHeaderIndex(HEADER_NUMBER_OF_ATTACHMENTS)]).toBe('0'); // empty components array

        expect(formFields1[report.getHeaderIndex(HEADER_ATTACHMENT_NAMES)]).toBe('Annet, Uttalelse fra fagpersonell'); // has attachments
        expect(formFields2[report.getHeaderIndex(HEADER_ATTACHMENT_NAMES)]).toBe(''); // no components
        expect(formFields3[report.getHeaderIndex(HEADER_ATTACHMENT_NAMES)]).toBe(''); // empty components array
      });

      it.each([undefined, '', ' \t '])('uses the label when the attachment title is %j', async (title) => {
        const form: Form = {
          path: 'attachment-labels',
          skjemanummer: 'EXAMPLE',
          title: 'Form,unchanged',
          properties: {
            skjemanummer: 'EXAMPLE',
            tema: 'TEST',
            submissionTypes: [],
            subsequentSubmissionTypes: [],
          },
          components: [
            {
              key: 'attachments',
              label: 'Attachments',
              type: 'panel',
              isAttachmentPanel: true,
              components: [
                {
                  key: 'missing-title',
                  label: '  Fallback,label  ',
                  type: 'attachment',
                  properties: { vedleggstittel: title },
                },
                {
                  key: 'named',
                  label: 'Different label',
                  type: 'attachment',
                  properties: { vedleggstittel: ' Preferred,title ', vedleggskode: 'N6' },
                },
              ],
            },
          ],
        };
        setupNock([form]);
        const summaryStream = createWritableStream();
        await reportService.generate('all-forms-summary', summaryStream);
        const summary = parseReport(summaryStream.toString());

        expect(summary.forms[0][summary.getHeaderIndex('vedleggsnavn')]).toBe('Fallback,label, Preferred,title');
        expect(summary.forms[0][summary.getHeaderIndex('antall vedlegg')]).toBe('2');
        expect(summary.forms[0][summary.getHeaderIndex('skjematittel')]).toBe('Form,unchanged');

        setupNock([form]);
        const attachmentsStream = createWritableStream();
        await reportService.generate('all-forms-and-attachments', attachmentsStream);
        const attachments = parseReport(attachmentsStream.toString());
        expect(attachments.forms.map((row) => row.slice(2, 5))).toEqual([
          [title ?? '', '', '  Fallback,label  '],
          [' Preferred,title ', 'N6', 'Different label'],
        ]);
      });

      it.each([
        { declarationType: undefined, label: '', text: '' },
        { declarationType: DeclarationType.none, label: '', text: '' },
        { declarationType: DeclarationType.default, label: 'Standard', text: '' },
        { declarationType: DeclarationType.custom, label: 'Tilpasset', text: 'Custom declaration' },
      ])('reports declaration type $declarationType as "$label"', async ({ declarationType, label, text }) => {
        const form: Form = {
          title: 'Declaration form',
          skjemanummer: 'EXAMPLE',
          path: 'declaration-form',
          properties: {
            skjemanummer: 'EXAMPLE',
            tema: 'TEST',
            declarationType,
            declarationText: 'Custom declaration',
            submissionTypes: [],
            subsequentSubmissionTypes: [],
          },
          components: [],
        };
        setupNock([form]);
        const writableStream = createWritableStream();
        await reportService.generate('all-forms-summary', writableStream);
        const report = parseReport(writableStream.toString());

        expect(report.forms).toHaveLength(1);
        expect(report.forms[0][report.getHeaderIndex('erklæringstype')]).toBe(label);
        expect(report.forms[0][report.getHeaderIndex('tilpasset erklæringstekst')]).toBe(text);
      });

      it('has correct url fields', async () => {
        const HEADER_INNSENDING = 'innsendingsurl';
        const HEADER_INNSENDING_PAPER = 'innsendingsurl (papir)';
        const HEADER_INNSENDING_DIGITAL = 'innsendingsurl (digital)';
        const HEADER_INNSENDING_STATIC_PDF = 'innsendingsurl (static PDF)';
        const HEADER_UTEN_FORSTESIDE = 'utfyllingsurl (uten førsteside)';
        const HEADER_ETTERSENDING = 'ettersendingsurl';
        const HEADER_ETTERSENDING_DIGITAL = 'ettersendingsurl (digital)';
        const HEADER_ETTERSENDING_PAPER = 'ettersendingsurl (papir)';
        const HEADER_ETTERSENDING_STATIC_PDF = 'ettersendingsurl (static PDF)';
        const HEADER_ETTERSENDING_TYPES = 'subsequentSubmissionTypes';

        const publishedForms = [
          {
            title: 'Testskjema1',
            skjemanummer: 'TEST1',
            path: 'test1',
            status: 'published',
            components: [
              {
                type: 'panel',
                isAttachmentPanel: true,
                title: 'Vedlegg',
                components: [
                  {
                    type: 'attachment',
                    properties: {
                      vedleggstittel: 'Annet',
                      vedleggskode: 'N6',
                    } as ComponentProperties,
                  },
                  {
                    type: 'attachment',
                    properties: {
                      vedleggstittel: 'Uttalelse fra fagpersonell',
                      vedleggskode: 'L8',
                    } as ComponentProperties,
                  },
                ] as Component[],
              },
            ] as Component[],
            properties: {
              skjemanummer: 'TEST1',
              tema: 'HJE',
              published: '2022-07-28T10:00:10.325Z',
              publishedLanguages: ['en', 'nn-NO'],
              submissionTypes: ['DIGITAL', 'PAPER', 'STATIC_PDF'],
              subsequentSubmissionTypes: ['DIGITAL', 'PAPER'],
            },
          } as Form,
          {
            title: 'Testskjema2',
            skjemanummer: 'TEST2',
            tema: 'HJE',
            path: 'test2',
            status: 'published',
            components: [],
            properties: {
              skjemanummer: 'TEST2',
              tema: 'HJE',
              published: '2022-07-28T10:00:10.325Z',
              publishedLanguages: ['en'],
              submissionTypes: [],
              subsequentSubmissionTypes: ['PAPER'],
            },
          } as Form,
          {
            title: 'Testskjema3',
            skjemanummer: 'TEST3',
            path: 'test3',
            status: 'published',
            components: [
              {
                type: 'panel',
                isAttachmentPanel: true,
                title: 'Vedlegg',
                components: [
                  {
                    type: 'attachment',
                    properties: {
                      vedleggstittel: 'Annet',
                      vedleggskode: 'N6',
                    } as ComponentProperties,
                  },
                  {
                    type: 'attachment',
                    properties: {
                      vedleggstittel: 'Uttalelse fra fagpersonell',
                      vedleggskode: 'L8',
                    } as ComponentProperties,
                  },
                ] as Component[],
              },
            ] as Component[],
            properties: {
              skjemanummer: 'TEST3',
              tema: 'HJE',
              published: '2022-07-28T10:00:10.325Z',
              publishedLanguages: undefined,
              submissionTypes: ['PAPER'],
              subsequentSubmissionTypes: ['PAPER'],
            },
          } as Form,
        ];
        setupNock(publishedForms);

        const writableStream = createWritableStream();
        await reportService.generate('all-forms-summary', writableStream);
        const report = parseReport(writableStream.toString());
        expect(report.numberOfForms).toBe(3);
        expect(report.headers).not.toContain('første publiseringsdato');
        expect(report.headers.slice(-11)).toEqual([
          HEADER_INNSENDING,
          HEADER_INNSENDING_PAPER,
          HEADER_INNSENDING_DIGITAL,
          'innsendingsurl (nologin)',
          HEADER_INNSENDING_STATIC_PDF,
          HEADER_UTEN_FORSTESIDE,
          HEADER_ETTERSENDING,
          HEADER_ETTERSENDING_DIGITAL,
          HEADER_ETTERSENDING_PAPER,
          HEADER_ETTERSENDING_STATIC_PDF,
          'radnummer',
        ]);
        expect(report.headers.slice(0, -11).some((header) => header.includes('url'))).toBe(false);
        expect(report.forms.every((row) => row.length === report.headers.length)).toBe(true);

        const formFields1 = report.forms[0];
        const formFields2 = report.forms[1];
        const formFields3 = report.forms[2];

        const fyllutBaseUrl = 'https://fyllut-preprod.intern.dev.nav.no/fyllut';
        const ettersendingBaseUrl = 'https://fyllut-ettersending.intern.dev.nav.no/fyllut-ettersending';

        // innsending: PAPIR_OG_DIGITAL, ettersending: PAPIR_OG_DIGITAL, 1 attachment
        expect(formFields1[report.getHeaderIndex(HEADER_INNSENDING)]).toBe(`${fyllutBaseUrl}/test1`);
        expect(formFields1[report.getHeaderIndex(HEADER_INNSENDING_PAPER)]).toBe(`${fyllutBaseUrl}/test1?sub=paper`);
        expect(formFields1[report.getHeaderIndex(HEADER_INNSENDING_DIGITAL)]).toBe(
          `${fyllutBaseUrl}/test1?sub=digital`,
        );
        expect(formFields1[report.getHeaderIndex(HEADER_INNSENDING_STATIC_PDF)]).toBe(`${fyllutBaseUrl}/test1/pdf`);
        expect(formFields1[report.getHeaderIndex(HEADER_UTEN_FORSTESIDE)]).toBe('');
        expect(formFields1[report.getHeaderIndex(HEADER_ETTERSENDING)]).toBe(`${ettersendingBaseUrl}/test1`);
        expect(formFields1[report.getHeaderIndex(HEADER_ETTERSENDING_DIGITAL)]).toBe(
          `${ettersendingBaseUrl}/test1?sub=digital`,
        );
        expect(formFields1[report.getHeaderIndex(HEADER_ETTERSENDING_PAPER)]).toBe(
          `${ettersendingBaseUrl}/test1?sub=paper`,
        );
        expect(formFields1[report.getHeaderIndex(HEADER_ETTERSENDING_STATIC_PDF)]).toBe(
          `${fyllutBaseUrl}/test1/pdf?type=ettersending`,
        );
        expect(formFields1[report.getHeaderIndex(HEADER_ETTERSENDING_TYPES)]).toBe(
          '"[""DIGITAL"", ""PAPER"", ""STATIC_PDF""]"',
        );
        expect(formFields1[report.getHeaderIndex('submissionTypes')]).toBe(
          '"[""DIGITAL"", ""PAPER"", ""STATIC_PDF""]"',
        );
        expect(formFields2[report.getHeaderIndex('submissionTypes')]).toBe('[]');
        expect(formFields2[report.getHeaderIndex(HEADER_ETTERSENDING_TYPES)]).toBe('"[""PAPER""]"');

        // innsending: INGEN, ettersending: KUN_PAPIR, 0 attachments
        expect(formFields2[report.getHeaderIndex(HEADER_INNSENDING)]).toBe(`${fyllutBaseUrl}/test2`);
        expect(formFields2[report.getHeaderIndex(HEADER_INNSENDING_PAPER)]).toBe('');
        expect(formFields2[report.getHeaderIndex(HEADER_UTEN_FORSTESIDE)]).toBe(
          `${fyllutBaseUrl}/test2?sub=papernocoverpage`,
        );
        expect(formFields2[report.getHeaderIndex(HEADER_INNSENDING_DIGITAL)]).toBe('');
        expect(formFields2[report.getHeaderIndex(HEADER_INNSENDING_STATIC_PDF)]).toBe('');
        expect(formFields2[report.getHeaderIndex(HEADER_ETTERSENDING)]).toBe(``); // no attachments
        expect(formFields2[report.getHeaderIndex(HEADER_ETTERSENDING_DIGITAL)]).toBe('');
        expect(formFields2[report.getHeaderIndex(HEADER_ETTERSENDING_PAPER)]).toBe(``);
        expect(formFields2[report.getHeaderIndex(HEADER_ETTERSENDING_STATIC_PDF)]).toBe('');

        // innsending: KUN_PAPIR, ettersending: KUN_PAPIR, 1 attachments
        expect(formFields3[report.getHeaderIndex(HEADER_INNSENDING)]).toBe(`${fyllutBaseUrl}/test3`);
        expect(formFields3[report.getHeaderIndex(HEADER_INNSENDING_PAPER)]).toBe(`${fyllutBaseUrl}/test3?sub=paper`);
        expect(formFields3[report.getHeaderIndex(HEADER_UTEN_FORSTESIDE)]).toBe('');
        expect(formFields3[report.getHeaderIndex(HEADER_INNSENDING_DIGITAL)]).toBe('');
        expect(formFields3[report.getHeaderIndex(HEADER_INNSENDING_STATIC_PDF)]).toBe('');
        expect(formFields3[report.getHeaderIndex(HEADER_ETTERSENDING)]).toBe(`${ettersendingBaseUrl}/test3`);
        expect(formFields3[report.getHeaderIndex(HEADER_ETTERSENDING_DIGITAL)]).toBe('');
        expect(formFields3[report.getHeaderIndex(HEADER_ETTERSENDING_PAPER)]).toBe(
          `${ettersendingBaseUrl}/test3?sub=paper`,
        );
        expect(formFields3[report.getHeaderIndex(HEADER_ETTERSENDING_STATIC_PDF)]).toBe('');
      });

      it('counts legacy signatures consistently with the signer labels', async () => {
        const form: Form = {
          path: 'legacy-signatures',
          skjemanummer: 'EXAMPLE',
          title: 'Legacy signatures',
          components: [],
          properties: {
            skjemanummer: 'EXAMPLE',
            tema: 'TEST',
            submissionTypes: ['PAPER'],
            subsequentSubmissionTypes: [],
            signatures: { signature1: 'Doctor', signature2: 'Applicant' },
          },
        };
        setupNock([form]);
        const writableStream = createWritableStream();
        await reportService.generate('all-forms-summary', writableStream);
        const report = parseReport(writableStream.toString());

        expect(report.forms[0][report.getHeaderIndex('signaturfelt')]).toBe('2');
        expect(report.forms[0][report.getHeaderIndex('hvem signerer, hvis ikke standard')]).toBe('Doctor, Applicant');
      });

      it('does not enable subsequent submission for a panel without attachment components', async () => {
        const form: Form = {
          path: 'attachment-panel-content',
          skjemanummer: 'EXAMPLE',
          title: 'Attachment panel content',
          components: [
            {
              key: 'attachments',
              label: 'Attachments',
              type: 'panel',
              isAttachmentPanel: true,
              components: [{ key: 'information', label: 'Information', type: 'content', html: 'Information' }],
            },
          ],
          properties: {
            skjemanummer: 'EXAMPLE',
            tema: 'TEST',
            submissionTypes: ['DIGITAL', 'PAPER', 'STATIC_PDF'],
            subsequentSubmissionTypes: ['DIGITAL', 'PAPER'],
          },
        };
        setupNock([form]);
        const writableStream = createWritableStream();
        await reportService.generate('all-forms-summary', writableStream);
        const report = parseReport(writableStream.toString());

        expect(report.forms[0][report.getHeaderIndex('antall vedlegg')]).toBe('0');
        expect(report.forms[0][report.getHeaderIndex('subsequentSubmissionTypes')]).toBe('"[""DIGITAL"", ""PAPER""]"');
        for (const header of report.headers.filter((header) => header.startsWith('ettersendingsurl'))) {
          expect(report.forms[0][report.getHeaderIndex(header)]).toBe('');
        }
      });

      it('includes legacy attachment components when enabling subsequent submission', async () => {
        const form: Form = {
          path: 'legacy-attachment',
          skjemanummer: 'EXAMPLE',
          title: 'Legacy attachment',
          components: [
            {
              key: 'attachments',
              label: 'Attachments',
              type: 'panel',
              isAttachmentPanel: true,
              components: [
                {
                  key: 'document',
                  label: 'Document',
                  type: 'radiopanel',
                  values: [{ label: 'Attach now', value: 'leggerVedNaa' }],
                  properties: { vedleggstittel: 'Document' },
                },
              ],
            },
          ],
          properties: {
            skjemanummer: 'EXAMPLE',
            tema: 'TEST',
            submissionTypes: ['DIGITAL', 'PAPER', 'STATIC_PDF'],
            subsequentSubmissionTypes: ['DIGITAL', 'PAPER'],
          },
        };
        setupNock([form]);
        const writableStream = createWritableStream();
        await reportService.generate('all-forms-summary', writableStream);
        const report = parseReport(writableStream.toString());
        const submissionUrl = 'https://fyllut-preprod.intern.dev.nav.no/fyllut/legacy-attachment';
        const subsequentUrl = 'https://fyllut-ettersending.intern.dev.nav.no/fyllut-ettersending/legacy-attachment';

        expect(report.forms[0][report.getHeaderIndex('antall vedlegg')]).toBe('1');
        expect(report.forms[0][report.getHeaderIndex('subsequentSubmissionTypes')]).toBe(
          '"[""DIGITAL"", ""PAPER"", ""STATIC_PDF""]"',
        );
        expect(report.forms[0][report.getHeaderIndex('ettersendingsurl')]).toBe(subsequentUrl);
        expect(report.forms[0][report.getHeaderIndex('ettersendingsurl (digital)')]).toBe(
          `${subsequentUrl}?sub=digital`,
        );
        expect(report.forms[0][report.getHeaderIndex('ettersendingsurl (papir)')]).toBe(`${subsequentUrl}?sub=paper`);
        expect(report.forms[0][report.getHeaderIndex('ettersendingsurl (static PDF)')]).toBe(
          `${submissionUrl}/pdf?type=ettersending`,
        );
      });

      describe('URLs for supported submission options', () => {
        const submissionUrl = 'https://fyllut-preprod.intern.dev.nav.no/fyllut/url-options';
        const subsequentUrl = 'https://fyllut-ettersending.intern.dev.nav.no/fyllut-ettersending/url-options';
        const paperUrl = `${submissionUrl}?sub=paper`;
        const digitalUrl = `${submissionUrl}?sub=digital`;
        const staticPdfSubmissionUrl = `${submissionUrl}/pdf`;
        const noLoginUrl = `${submissionUrl}?sub=digitalnologin`;
        const paperNoCoverPageUrl = `${submissionUrl}?sub=papernocoverpage`;
        const digitalSubsequentUrl = `${subsequentUrl}?sub=digital`;
        const paperSubsequentUrl = `${subsequentUrl}?sub=paper`;
        const staticPdfUrl = `${submissionUrl}/pdf?type=ettersending`;

        it.each<{
          name: string;
          submissionTypes: SubmissionType[];
          subsequentSubmissionTypes: SubmissionType[];
          hasAttachments: boolean;
          urls: string[];
        }>([
          {
            name: 'digital submission without subsequent submission',
            submissionTypes: ['DIGITAL'],
            subsequentSubmissionTypes: [],
            hasAttachments: true,
            urls: [submissionUrl, '', digitalUrl, '', '', '', '', '', '', ''],
          },
          {
            name: 'paper submission and digital subsequent submission',
            submissionTypes: ['PAPER'],
            subsequentSubmissionTypes: ['DIGITAL'],
            hasAttachments: true,
            urls: [submissionUrl, paperUrl, '', '', '', '', subsequentUrl, digitalSubsequentUrl, '', ''],
          },
          {
            name: 'paper submission and paper subsequent submission',
            submissionTypes: ['PAPER'],
            subsequentSubmissionTypes: ['PAPER'],
            hasAttachments: true,
            urls: [submissionUrl, paperUrl, '', '', '', '', subsequentUrl, '', paperSubsequentUrl, ''],
          },
          {
            name: 'nologin submission without subsequent submission',
            submissionTypes: ['DIGITAL_NO_LOGIN'],
            subsequentSubmissionTypes: [],
            hasAttachments: true,
            urls: [submissionUrl, '', '', noLoginUrl, '', '', '', '', '', ''],
          },
          {
            name: 'static PDF with attachments',
            submissionTypes: ['STATIC_PDF'],
            subsequentSubmissionTypes: [],
            hasAttachments: true,
            urls: ['', '', '', '', staticPdfSubmissionUrl, '', '', '', '', staticPdfUrl],
          },
          {
            name: 'static PDF without attachments',
            submissionTypes: ['STATIC_PDF'],
            subsequentSubmissionTypes: [],
            hasAttachments: false,
            urls: ['', '', '', '', staticPdfSubmissionUrl, '', '', '', '', ''],
          },
          {
            name: 'fill-in and download without a cover page',
            submissionTypes: ['PAPER_NO_COVER_PAGE'],
            subsequentSubmissionTypes: [],
            hasAttachments: true,
            urls: [submissionUrl, '', '', '', '', paperNoCoverPageUrl, '', '', '', ''],
          },
          {
            name: 'legacy fill-in and download with no submission types',
            submissionTypes: [],
            subsequentSubmissionTypes: [],
            hasAttachments: true,
            urls: [submissionUrl, '', '', '', '', paperNoCoverPageUrl, '', '', '', ''],
          },
          {
            name: 'digital plus no-cover-page',
            submissionTypes: ['DIGITAL', 'PAPER_NO_COVER_PAGE'],
            subsequentSubmissionTypes: [],
            hasAttachments: false,
            urls: [submissionUrl, '', digitalUrl, '', '', paperNoCoverPageUrl, '', '', '', ''],
          },
          {
            name: 'paper plus no-cover-page',
            submissionTypes: ['PAPER', 'PAPER_NO_COVER_PAGE'],
            subsequentSubmissionTypes: [],
            hasAttachments: false,
            urls: [submissionUrl, paperUrl, '', '', '', paperNoCoverPageUrl, '', '', '', ''],
          },
          {
            name: 'nologin plus no-cover-page',
            submissionTypes: ['DIGITAL_NO_LOGIN', 'PAPER_NO_COVER_PAGE'],
            subsequentSubmissionTypes: [],
            hasAttachments: false,
            urls: [submissionUrl, '', '', noLoginUrl, '', paperNoCoverPageUrl, '', '', '', ''],
          },
          {
            name: 'static PDF plus no-cover-page',
            submissionTypes: ['STATIC_PDF', 'PAPER_NO_COVER_PAGE'],
            subsequentSubmissionTypes: [],
            hasAttachments: true,
            urls: [submissionUrl, '', '', '', staticPdfSubmissionUrl, paperNoCoverPageUrl, '', '', '', staticPdfUrl],
          },
          {
            name: 'all options with attachments',
            submissionTypes: ['DIGITAL', 'PAPER', 'DIGITAL_NO_LOGIN', 'STATIC_PDF'],
            subsequentSubmissionTypes: ['DIGITAL', 'PAPER'],
            hasAttachments: true,
            urls: [
              submissionUrl,
              paperUrl,
              digitalUrl,
              noLoginUrl,
              staticPdfSubmissionUrl,
              '',
              subsequentUrl,
              digitalSubsequentUrl,
              paperSubsequentUrl,
              staticPdfUrl,
            ],
          },
          {
            name: 'all options without attachments',
            submissionTypes: ['DIGITAL', 'PAPER', 'DIGITAL_NO_LOGIN', 'STATIC_PDF'],
            subsequentSubmissionTypes: ['DIGITAL', 'PAPER'],
            hasAttachments: false,
            urls: [submissionUrl, paperUrl, digitalUrl, noLoginUrl, staticPdfSubmissionUrl, '', '', '', '', ''],
          },
          {
            name: 'all options plus no-cover-page',
            submissionTypes: ['DIGITAL', 'PAPER', 'DIGITAL_NO_LOGIN', 'STATIC_PDF', 'PAPER_NO_COVER_PAGE'],
            subsequentSubmissionTypes: ['DIGITAL', 'PAPER'],
            hasAttachments: true,
            urls: [
              submissionUrl,
              paperUrl,
              digitalUrl,
              noLoginUrl,
              staticPdfSubmissionUrl,
              paperNoCoverPageUrl,
              subsequentUrl,
              digitalSubsequentUrl,
              paperSubsequentUrl,
              staticPdfUrl,
            ],
          },
          {
            name: 'all options, no-cover, no attachments',
            submissionTypes: ['DIGITAL', 'PAPER', 'DIGITAL_NO_LOGIN', 'STATIC_PDF', 'PAPER_NO_COVER_PAGE'],
            subsequentSubmissionTypes: ['DIGITAL', 'PAPER'],
            hasAttachments: false,
            urls: [
              submissionUrl,
              paperUrl,
              digitalUrl,
              noLoginUrl,
              staticPdfSubmissionUrl,
              paperNoCoverPageUrl,
              '',
              '',
              '',
              '',
            ],
          },
        ])('$name', async ({ submissionTypes, subsequentSubmissionTypes, hasAttachments, urls }) => {
          const form: Form = {
            path: 'url-options',
            skjemanummer: 'EXAMPLE',
            title: 'URL options',
            properties: {
              skjemanummer: 'EXAMPLE',
              tema: 'TEST',
              submissionTypes,
              subsequentSubmissionTypes,
            },
            components: hasAttachments
              ? [
                  {
                    key: 'attachments',
                    label: 'Attachments',
                    type: 'panel',
                    isAttachmentPanel: true,
                    components: [{ key: 'document', label: 'Document', type: 'attachment' }],
                  },
                ]
              : [],
          };
          setupNock([form]);
          const writableStream = createWritableStream();
          await reportService.generate('all-forms-summary', writableStream);
          const report = parseReport(writableStream.toString());

          expect(report.forms).toHaveLength(1);
          expect(report.headers).toContain('utfyllingsurl (uten førsteside)');
          expect(report.forms[0].slice(-11)).toEqual([...urls, '1']);
        });
      });

      it.each([
        {
          cluster: 'dev-gcp' as const,
          submissionBase: 'https://fyllut-preprod.intern.dev.nav.no/fyllut',
          subsequentBase: 'https://fyllut-ettersending.intern.dev.nav.no/fyllut-ettersending',
        },
        {
          cluster: 'prod-gcp' as const,
          submissionBase: 'https://www.nav.no/fyllut',
          subsequentBase: 'https://www.nav.no/fyllut-ettersending',
        },
      ])('uses the correct URL hosts in $cluster', async ({ cluster, submissionBase, subsequentBase }) => {
        const originalCluster = config.naisClusterName;
        config.naisClusterName = cluster;
        try {
          const form: Form = {
            path: 'url-hosts',
            skjemanummer: 'EXAMPLE',
            title: 'URL hosts',
            properties: {
              skjemanummer: 'EXAMPLE',
              tema: 'TEST',
              submissionTypes: ['DIGITAL', 'PAPER', 'DIGITAL_NO_LOGIN', 'STATIC_PDF', 'PAPER_NO_COVER_PAGE'],
              subsequentSubmissionTypes: ['DIGITAL', 'PAPER'],
            },
            components: [
              {
                key: 'attachments',
                label: 'Attachments',
                type: 'panel',
                isAttachmentPanel: true,
                components: [{ key: 'document', label: 'Document', type: 'attachment' }],
              },
            ],
          };
          setupNock([form]);
          const writableStream = createWritableStream();
          await reportService.generate('all-forms-summary', writableStream);
          const report = parseReport(writableStream.toString());

          expect(report.forms[0].slice(-11)).toEqual([
            `${submissionBase}/url-hosts`,
            `${submissionBase}/url-hosts?sub=paper`,
            `${submissionBase}/url-hosts?sub=digital`,
            `${submissionBase}/url-hosts?sub=digitalnologin`,
            `${submissionBase}/url-hosts/pdf`,
            `${submissionBase}/url-hosts?sub=papernocoverpage`,
            `${subsequentBase}/url-hosts`,
            `${subsequentBase}/url-hosts?sub=digital`,
            `${subsequentBase}/url-hosts?sub=paper`,
            `${submissionBase}/url-hosts/pdf?type=ettersending`,
            '1',
          ]);
        } finally {
          config.naisClusterName = originalCluster;
        }
      });

      it('does not include testform', async () => {
        const publishedForms = [
          {
            title: 'Testskjema1',
            components: [],
            skjemanummer: 'TEST1',
            path: 'test1',
            status: 'published',
            publishedLanguages: ['en', 'nn'],
            publishedAt: '2022-07-28T10:00:10.325Z',
            properties: {} as FormPropertiesType,
          } as Form,
          {
            title: 'Testskjema2',
            components: [],
            skjemanummer: 'TEST2',
            path: 'test2',
            status: 'published',
            publishedLanguages: ['en'],
            publishedAt: '2022-07-28T10:00:10.325Z',
            properties: {
              isTestForm: true, // <- testform
            } as FormPropertiesType,
          } as Form,
        ];
        setupNock(publishedForms);

        const writableStream = createWritableStream();
        await reportService.generate('forms-published-languages', writableStream);
        expect(writableStream.toString()).toEqual(CSV_HEADER_LINE + 'TEST1;en, nn;;Testskjema1;Testskjema1;[];1\n');
      });

      it('fails if unknown report', async () => {
        let errorCatched = false;
        const writableStream = createWritableStream();
        try {
          await reportService.generate('unknown-report-id', writableStream);
        } catch (_err) {
          errorCatched = true;
        }
        expect(errorCatched).toBe(true);
      });
    });

    describe('generateAllFormsAndAttachments', () => {
      it('has correct fields', async () => {
        const HEADER_FORM_NUMBER = 'skjemanummer';
        const HEADER_FORM_TITLE = 'skjematittel';
        const HEADER_ATTACHMENT_TITLE = 'vedleggstittel';
        const HEADER_ATTACHMENT_CODE = 'vedleggskode';
        const HEADER_LABEL = 'label';

        const publishedForms = [
          {
            title: 'Testskjema1',
            skjemanummer: 'TEST1',
            path: 'test1',
            status: 'published',
            components: [
              {
                type: 'panel',
                isAttachmentPanel: true,
                title: 'Vedlegg',
                components: [
                  {
                    label: 'Annen dokumentasjon',
                    type: 'attachment',
                    properties: {
                      vedleggstittel: 'Annet',
                      vedleggskode: 'N6',
                    } as ComponentProperties,
                  },
                  {
                    label: 'Uttalelse fra fagpersonell',
                    type: 'attachment',
                    properties: {
                      vedleggstittel: 'Uttalelse fra fagpersonell',
                      vedleggskode: 'L8',
                    } as ComponentProperties,
                  },
                ] as Component[],
              },
            ] as Component[],
            properties: {
              skjemanummer: 'TEST1',
            } as FormPropertiesType,
          } as Form,
          {
            title: 'Testskjema2',
            skjemanummer: 'TEST2',
            path: 'test2',
            status: 'published',
            components: [],
            properties: {
              skjemanummer: 'TEST2',
            } as FormPropertiesType,
          } as Form,
        ];
        setupNock(publishedForms);

        const writableStream = createWritableStream();
        await reportService.generate('all-forms-and-attachments', writableStream);
        const report = parseReport(writableStream.toString());
        expect(report.numberOfForms).toBe(2);
        expect(report.headers.at(-1)).toBe('radnummer');
        expect(report.forms.map((row) => row.at(-1))).toEqual(['1', '2']);

        const formFields1 = report.forms[0];
        const formFields2 = report.forms[1];

        expect(formFields1[report.getHeaderIndex(HEADER_FORM_NUMBER)]).toBe('TEST1');
        expect(formFields1[report.getHeaderIndex(HEADER_FORM_TITLE)]).toBe('Testskjema1');
        expect(formFields1[report.getHeaderIndex(HEADER_ATTACHMENT_TITLE)]).toBe('Annet');
        expect(formFields1[report.getHeaderIndex(HEADER_ATTACHMENT_CODE)]).toBe('N6');
        expect(formFields1[report.getHeaderIndex(HEADER_LABEL)]).toBe('Annen dokumentasjon');

        expect(formFields2[report.getHeaderIndex(HEADER_FORM_NUMBER)]).toBe('TEST1');
        expect(formFields2[report.getHeaderIndex(HEADER_FORM_TITLE)]).toBe('Testskjema1');
        expect(formFields2[report.getHeaderIndex(HEADER_ATTACHMENT_TITLE)]).toBe('Uttalelse fra fagpersonell');
        expect(formFields2[report.getHeaderIndex(HEADER_ATTACHMENT_CODE)]).toBe('L8');
        expect(formFields2[report.getHeaderIndex(HEADER_LABEL)]).toBe('Uttalelse fra fagpersonell');
      });
    });

    describe('unpublished forms', () => {
      it('appends consecutive row numbers after filtering out published forms', async () => {
        setupNock([
          {
            path: 'first',
            skjemanummer: 'FIRST',
            title: 'First form',
            status: 'unpublished',
            publishedAt: '2026-01-01T12:00:00Z',
            publishedBy: 'example',
          },
          { path: 'published', status: 'published' },
          {
            path: 'second',
            skjemanummer: 'SECOND',
            title: 'Second form',
            status: 'unpublished',
          },
        ]);

        const writableStream = createWritableStream();
        await reportService.generate('unpublished-forms', writableStream);

        expect(writableStream.toString()).toBe(
          '\uFEFFskjemanummer;skjematittel;avpublisert;avpublisert av;radnummer\n' +
            'FIRST;First form;2026-01-01T12:00:00Z;example;1\n' +
            'SECOND;Second form;;;2\n',
        );
      });
    });
  });
});
