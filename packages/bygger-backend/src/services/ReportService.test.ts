import { Component, ComponentProperties, Form, FormPropertiesType } from '@navikt/skjemadigitalisering-shared-domain';
import { parse } from 'csv-parse/sync';
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

  it('rejects an unknown report ID', async () => {
    const destination = new MemoryStream(undefined, { readable: false });
    await expect(reportService.generate('unknown-report-id', destination)).rejects.toThrow(
      'Report not implemented: unknown-report-id',
    );
  });

  describe('all-forms-summary', () => {
    const createWritableStream = () => new MemoryStream(undefined, { readable: false });

    const setupNock = (publishedForms: Partial<Form>[]) => {
      nock(formsApi.url).get('/v1/recipients').reply(200, []);
      nock(formsApi.url)
        .get(/\/v1\/forms\?.*$/)
        .times(1)
        .reply(200, publishedForms);
      for (const form of publishedForms) {
        nock(formsApi.url).get(`/v1/forms/${form.path}/static-pdfs`).reply(200, []);
        nock(formsApi.url).get(`/v1/forms/${form.path}`).reply(200, form);
      }
    };

    const parseReport = (content: string) => {
      const [headers, ...forms] = parse(content, { bom: true, delimiter: ';' }) as string[][];
      return {
        headers,
        forms,
        numberOfForms: forms.length,
        getHeaderIndex: (overskrift: string) => headers.indexOf(overskrift),
      };
    };

    describe('legacy columns', () => {
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
    });
  });
});
