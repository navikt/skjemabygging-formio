import { Component, FormPropertiesType, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import MemoryStream from 'memorystream';
import nock from 'nock';
import { ComponentProperties } from '../../../shared-domain/src/form';
import config from '../config';
import ReportService from './ReportService';
import { formioService } from './index';

describe('ReportService', () => {
  let reportService: ReportService;

  beforeEach(() => {
    reportService = new ReportService(formioService);
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

    let nockScope: nock.Scope;

    afterEach(() => {
      expect(nockScope.isDone()).toBe(true);
    });

    // @ts-ignore
    const createWritableStream = () => new MemoryStream(undefined, { readable: false });

    const setupNock = (publishedForms: Partial<NavFormType>[]) => {
      nockScope = nock(config.formio.projectUrl)
        .get(/\/form\?.*$/)
        .times(1)
        .reply(200, publishedForms);
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
              properties: {
                skjemanummer: 'TEST1',
                published: '2022-07-28T10:00:10.325Z',
                modified: '2022-07-28T10:00:10.325Z',
              } as FormPropertiesType,
            },
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
              properties: {
                skjemanummer: 'TEST1',
                published: '2022-07-28T10:00:10.325Z',
                modified: '2022-07-28T11:00:05.254Z',
              } as FormPropertiesType,
            },
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
              properties: {
                skjemanummer: 'TEST1',
                modified: '2022-07-28T11:00:05.254Z',
              } as FormPropertiesType,
            },
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
            properties: {
              skjemanummer: 'TEST1',
              published: '2022-07-28T10:00:10.325Z',
              publishedLanguages: ['en', 'nn-NO'],
            } as FormPropertiesType,
          },
          {
            title: 'Testskjema2',
            components: [],
            properties: {
              skjemanummer: 'TEST2',
              published: '2022-07-28T10:00:10.325Z',
              publishedLanguages: ['en'],
            } as FormPropertiesType,
          },
          {
            title: 'Testskjema3',
            components: [],
            properties: {
              skjemanummer: 'TEST3',
              published: '2022-07-28T10:00:10.325Z',
              publishedLanguages: undefined,
            } as FormPropertiesType,
          },
        ];
        setupNock(publishedForms);

        const writableStream = createWritableStream();
        await reportService.generate('forms-published-languages', writableStream);
        expect(writableStream.toString()).toEqual(
          CSV_HEADER_LINE + 'TEST1;Testskjema1;en,nn-NO\nTEST2;Testskjema2;en\nTEST3;Testskjema3;\n',
        );
      });

      it('has correct attachment fields', async () => {
        const HEADER_HAS_ATTACHMENTS = 'har vedlegg';
        const HEADER_NUMBER_OF_ATTACHMENTS = 'antall vedlegg';
        const HEADER_ATTACHMENT_NAMES = 'vedleggsnavn';

        const publishedForms = [
          {
            title: 'Testskjema1',
            components: [
              {
                type: 'panel',
                isAttachmentPanel: true,
                title: 'Vedlegg',
                components: [
                  {
                    values: [{ value: 'leggerVedNaa' }],
                    properties: {
                      vedleggstittel: 'Annet',
                      vedleggskode: 'N6',
                    } as ComponentProperties,
                  },
                  {
                    values: [{ value: 'leggerVedNaa' }],
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
              published: '2022-07-28T10:00:10.325Z',
              publishedLanguages: ['en', 'nn-NO'],
            } as FormPropertiesType,
          },
          {
            title: 'Testskjema2',
            components: [],
            properties: {
              skjemanummer: 'TEST2',
              published: '2022-07-28T10:00:10.325Z',
              publishedLanguages: ['en'],
            } as FormPropertiesType,
          },
          {
            title: 'Testskjema3',
            components: [
              {
                type: 'panel',
                isAttachmentPanel: true,
                title: 'Vedlegg',
                components: [] as Component[],
              },
            ] as Component[],
            properties: {
              skjemanummer: 'TEST3',
              published: '2022-07-28T10:00:10.325Z',
              publishedLanguages: undefined,
            } as FormPropertiesType,
          },
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
        const HEADER_INNSENDING_DIGITAL = 'innsending (digital)';
        const HEADER_INNSENDING_PAPER = 'innsending (papir)';
        const HEADER_ETTERSENDING_DIGITAL = 'ettersending (digital)';
        const HEADER_ETTERSENDING_PAPER = 'ettersending (papir)';

        const publishedForms = [
          {
            title: 'Testskjema1',
            path: 'test1',
            components: [
              {
                type: 'panel',
                isAttachmentPanel: true,
                title: 'Vedlegg',
                components: [
                  {
                    values: [{ value: 'leggerVedNaa' }],
                    properties: {
                      vedleggstittel: 'Annet',
                      vedleggskode: 'N6',
                    } as ComponentProperties,
                  },
                  {
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
              published: '2022-07-28T10:00:10.325Z',
              publishedLanguages: ['en', 'nn-NO'],
              innsending: 'PAPIR_OG_DIGITAL',
              ettersending: 'PAPIR_OG_DIGITAL',
            } as FormPropertiesType,
          },
          {
            title: 'Testskjema2',
            path: 'test2',
            components: [],
            properties: {
              skjemanummer: 'TEST2',
              published: '2022-07-28T10:00:10.325Z',
              publishedLanguages: ['en'],
              innsending: 'INGEN',
              ettersending: 'KUN_PAPIR',
            } as FormPropertiesType,
          },
          {
            title: 'Testskjema3',
            path: 'test3',
            components: [
              {
                type: 'panel',
                isAttachmentPanel: true,
                title: 'Vedlegg',
                components: [
                  {
                    values: [{ value: 'leggerVedNaa' }],
                    properties: {
                      vedleggstittel: 'Annet',
                      vedleggskode: 'N6',
                    } as ComponentProperties,
                  },
                  {
                    values: [{ value: 'leggerVedNaa' }],
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
              published: '2022-07-28T10:00:10.325Z',
              publishedLanguages: undefined,
              innsending: 'KUN_PAPIR',
              ettersending: 'KUN_PAPIR',
            } as FormPropertiesType,
          },
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
        const ettersendingBaseUrl = 'https://fyllut-ettersending.intern.dev.nav.no/fyllut-ettersending/detaljer';

        // innsending: PAPIR_OG_DIGITAL, ettersending: PAPIR_OG_DIGITAL, 1 attachment
        expect(formFields1[report.getHeaderIndex(HEADER_INNSENDING_DIGITAL)]).toBe(`${fyllutBaseUrl}/test1`);
        expect(formFields1[report.getHeaderIndex(HEADER_INNSENDING_PAPER)]).toBe(`${fyllutBaseUrl}/test1?sub=paper`);
        expect(formFields1[report.getHeaderIndex(HEADER_ETTERSENDING_DIGITAL)]).toBe(`${ettersendingBaseUrl}/test1`);
        expect(formFields1[report.getHeaderIndex(HEADER_ETTERSENDING_PAPER)]).toBe(
          `${ettersendingBaseUrl}/test1?sub=paper`,
        );

        // innsending: INGEN, ettersending: KUN_PAPIR, 0 attachments
        expect(formFields2[report.getHeaderIndex(HEADER_INNSENDING_DIGITAL)]).toBe(``);
        expect(formFields2[report.getHeaderIndex(HEADER_INNSENDING_PAPER)]).toBe(`${fyllutBaseUrl}/test2`);
        expect(formFields2[report.getHeaderIndex(HEADER_ETTERSENDING_DIGITAL)]).toBe(``); // no attachments
        expect(formFields2[report.getHeaderIndex(HEADER_ETTERSENDING_PAPER)]).toBe(``);

        // innsending: KUN_PAPIR, ettersending: KUN_PAPIR, 1 attachments
        expect(formFields3[report.getHeaderIndex(HEADER_INNSENDING_DIGITAL)]).toBe(``);
        expect(formFields3[report.getHeaderIndex(HEADER_INNSENDING_PAPER)]).toBe(`${fyllutBaseUrl}/test3?sub=paper`);
        expect(formFields3[report.getHeaderIndex(HEADER_ETTERSENDING_DIGITAL)]).toBe(``);
        expect(formFields3[report.getHeaderIndex(HEADER_ETTERSENDING_PAPER)]).toBe(
          `${ettersendingBaseUrl}/test3?sub=paper`,
        );
      });

      it('does not include testform', async () => {
        const publishedForms = [
          {
            title: 'Testskjema1',
            components: [],
            properties: {
              skjemanummer: 'TEST1',
              published: '2022-07-28T10:00:10.325Z',
              publishedLanguages: ['en', 'nn-NO'],
            } as FormPropertiesType,
          },
          {
            title: 'Testskjema2',
            components: [],
            properties: {
              skjemanummer: 'TEST2',
              published: '2022-07-28T10:00:10.325Z',
              publishedLanguages: ['en'],
              isTestForm: true, // <- testform
            } as FormPropertiesType,
          },
        ];
        setupNock(publishedForms);

        const writableStream = createWritableStream();
        await reportService.generate('forms-published-languages', writableStream);
        expect(writableStream.toString()).toEqual(CSV_HEADER_LINE + 'TEST1;Testskjema1;en,nn-NO\n');
      });

      it('fails if unknown report', async () => {
        let errorCatched = false;
        const writableStream = createWritableStream();
        try {
          await reportService.generate('unknown-report-id', writableStream);
        } catch (err) {
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
            path: 'test1',
            components: [
              {
                type: 'panel',
                isAttachmentPanel: true,
                title: 'Vedlegg',
                components: [
                  {
                    label: 'Annen dokumentasjon',
                    values: [{ value: 'leggerVedNaa' }],
                    properties: {
                      vedleggstittel: 'Annet',
                      vedleggskode: 'N6',
                    } as ComponentProperties,
                  },
                  {
                    label: 'Uttalelse fra fagpersonell',
                    values: [{ value: 'leggerVedNaa' }],
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
          },
          {
            title: 'Testskjema2',
            path: 'test2',
            components: [],
            properties: {
              skjemanummer: 'TEST2',
            } as FormPropertiesType,
          },
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
