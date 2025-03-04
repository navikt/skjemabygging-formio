import { Component, Form, FormPropertiesType, PublishedTranslations } from '@navikt/skjemadigitalisering-shared-domain';
import MemoryStream from 'memorystream';
import nock from 'nock';
import { ComponentProperties } from '../../../shared-domain/src/form';
import config from '../config';
import ReportService from './ReportService';
import { formPublicationsService, formsService } from './index';

const { formsApi } = config;

describe('ReportService', () => {
  let reportService: ReportService;

  beforeEach(() => {
    reportService = new ReportService(formsService, formPublicationsService);
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
    const CSV_HEADER_LINE = 'skjemanummer;skjematittel;språk\n';

    const createWritableStream = () => new MemoryStream(undefined, { readable: false });

    const setupNock = (publishedForms: Partial<Form>[]) => {
      nock(formsApi.url)
        .get(/\/v1\/forms\?.*$/)
        .times(1)
        .reply(200, publishedForms);
      nock(formsApi.url)
        .get(/\/v1\/form-publications$/)
        .times(1)
        .reply(200, publishedForms);
      for (const form of publishedForms) {
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
      const headers = allLines[0].split(';');
      return {
        headers,
        forms,
        numberOfForms: forms.length,
        getHeaderIndex: (overskrift: string) => headers.indexOf(overskrift),
      };
    }

    describe('generateFormsPublishedLanguage', () => {
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
              } as FormPropertiesType,
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
              } as FormPropertiesType,
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
              } as FormPropertiesType,
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
              } as FormPropertiesType,
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
              } as FormPropertiesType,
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
              } as FormPropertiesType,
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
      it('includes published forms with its respective languages', async () => {
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
            } as FormPropertiesType,
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
            } as FormPropertiesType,
          } as Form,
          {
            title: 'Testskjema3',
            components: [],
            skjemanummer: 'TEST3',
            path: 'test3',
            publishedAt: '2022-07-28T10:00:10.325Z',
            publishedLanguages: ['nb'],
            status: 'published',
            properties: {} as FormPropertiesType,
          } as Form,
        ];
        setupNock(publishedForms);

        const writableStream = createWritableStream();
        await reportService.generate('forms-published-languages', writableStream);
        expect(writableStream.toString()).toEqual(
          CSV_HEADER_LINE + 'TEST1;Testskjema1;nb,en,nn\nTEST2;Testskjema2;nb,en\nTEST3;Testskjema3;nb\n',
        );
      });

      it('has correct attachment fields', async () => {
        const HEADER_HAS_ATTACHMENTS = 'har vedlegg';
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
            properties: {} as FormPropertiesType,
          } as Form,
          {
            title: 'Testskjema2',
            components: [],
            skjemanummer: 'TEST2',
            path: 'test2',
            status: 'published',
            properties: {} as FormPropertiesType,
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
            properties: {} as FormPropertiesType,
          } as Form,
        ];
        setupNock(publishedForms);

        const writableStream = createWritableStream();
        await reportService.generate('all-forms-summary', writableStream);
        const report = parseReport(writableStream.toString());
        expect(report.numberOfForms).toBe(3);

        const formFields1 = report.forms[0];
        const formFields2 = report.forms[1];
        const formFields3 = report.forms[2];

        expect(formFields1[report.getHeaderIndex(HEADER_HAS_ATTACHMENTS)]).toBe('ja'); // has attachments
        expect(formFields2[report.getHeaderIndex(HEADER_HAS_ATTACHMENTS)]).toBe('nei'); // no components
        expect(formFields3[report.getHeaderIndex(HEADER_HAS_ATTACHMENTS)]).toBe('nei'); // empty components array

        expect(formFields1[report.getHeaderIndex(HEADER_NUMBER_OF_ATTACHMENTS)]).toBe('2'); // has attachments
        expect(formFields2[report.getHeaderIndex(HEADER_NUMBER_OF_ATTACHMENTS)]).toBe('0'); // no components
        expect(formFields3[report.getHeaderIndex(HEADER_NUMBER_OF_ATTACHMENTS)]).toBe('0'); // empty components array

        expect(formFields1[report.getHeaderIndex(HEADER_ATTACHMENT_NAMES)]).toBe('Annet,Uttalelse fra fagpersonell'); // has attachments
        expect(formFields2[report.getHeaderIndex(HEADER_ATTACHMENT_NAMES)]).toBe(''); // no components
        expect(formFields3[report.getHeaderIndex(HEADER_ATTACHMENT_NAMES)]).toBe(''); // empty components array
      });

      it('has correct url fields', async () => {
        const HEADER_INNSENDING = 'innsendingsurl';
        const HEADER_INNSENDING_PAPER = 'innsendingsurl (papir)';
        const HEADER_ETTERSENDING = 'ettersendingsurl';
        const HEADER_ETTERSENDING_PAPER = 'ettersendingsurl (papir)';

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
              submissionTypes: ['DIGITAL', 'PAPER'],
              ettersending: 'PAPIR_OG_DIGITAL',
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
              ettersending: 'KUN_PAPIR',
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
              ettersending: 'KUN_PAPIR',
            },
          } as Form,
        ];
        setupNock(publishedForms);

        const writableStream = createWritableStream();
        await reportService.generate('all-forms-summary', writableStream);
        const report = parseReport(writableStream.toString());
        expect(report.numberOfForms).toBe(3);

        const formFields1 = report.forms[0];
        const formFields2 = report.forms[1];
        const formFields3 = report.forms[2];

        const fyllutBaseUrl = 'https://fyllut-preprod.intern.dev.nav.no/fyllut';
        const ettersendingBaseUrl = 'https://fyllut-ettersending.intern.dev.nav.no/fyllut-ettersending';

        // innsending: PAPIR_OG_DIGITAL, ettersending: PAPIR_OG_DIGITAL, 1 attachment
        expect(formFields1[report.getHeaderIndex(HEADER_INNSENDING)]).toBe(`${fyllutBaseUrl}/test1`);
        expect(formFields1[report.getHeaderIndex(HEADER_INNSENDING_PAPER)]).toBe(`${fyllutBaseUrl}/test1?sub=paper`);
        expect(formFields1[report.getHeaderIndex(HEADER_ETTERSENDING)]).toBe(`${ettersendingBaseUrl}/test1`);
        expect(formFields1[report.getHeaderIndex(HEADER_ETTERSENDING_PAPER)]).toBe(
          `${ettersendingBaseUrl}/test1?sub=paper`,
        );

        // innsending: INGEN, ettersending: KUN_PAPIR, 0 attachments
        expect(formFields2[report.getHeaderIndex(HEADER_INNSENDING)]).toBe(`${fyllutBaseUrl}/test2`);
        expect(formFields2[report.getHeaderIndex(HEADER_INNSENDING_PAPER)]).toBe(`${fyllutBaseUrl}/test2`);
        expect(formFields2[report.getHeaderIndex(HEADER_ETTERSENDING)]).toBe(``); // no attachments
        expect(formFields2[report.getHeaderIndex(HEADER_ETTERSENDING_PAPER)]).toBe(``);

        // innsending: KUN_PAPIR, ettersending: KUN_PAPIR, 1 attachments
        expect(formFields3[report.getHeaderIndex(HEADER_INNSENDING)]).toBe(`${fyllutBaseUrl}/test3`);
        expect(formFields3[report.getHeaderIndex(HEADER_INNSENDING_PAPER)]).toBe(`${fyllutBaseUrl}/test3?sub=paper`);
        expect(formFields3[report.getHeaderIndex(HEADER_ETTERSENDING)]).toBe(`${ettersendingBaseUrl}/test3`);
        expect(formFields3[report.getHeaderIndex(HEADER_ETTERSENDING_PAPER)]).toBe(
          `${ettersendingBaseUrl}/test3?sub=paper`,
        );
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
        expect(writableStream.toString()).toEqual(CSV_HEADER_LINE + 'TEST1;Testskjema1;en,nn\n');
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
  });
});
