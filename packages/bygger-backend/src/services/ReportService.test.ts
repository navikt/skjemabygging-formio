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
  });
});
