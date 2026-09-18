import { ReportDefinition } from '@navikt/skjemadigitalisering-shared-domain';
import { Writable } from 'node:stream';
import { writeCsvReport } from './reports/csvPipeline';
import { allFormsSummaryReport } from './reports/definitions/allFormsSummaryReport';
import { attachmentsReport } from './reports/definitions/attachmentsReport';
import { publishedLanguagesReport } from './reports/definitions/publishedLanguagesReport';
import { unpublishedFormsReport } from './reports/definitions/unpublishedFormsReport';
import { ReportDependencies } from './reports/types';

const ReportRegistry: Record<string, ReportDefinition> = {
  FORMS_PUBLISHED_LANGUAGES: {
    id: 'forms-published-languages',
    title: 'Publiserte språk per skjema',
    contentType: 'text/csv',
    fileExtension: 'csv',
  },
  ALL_FORMS_SUMMARY: {
    id: 'all-forms-summary',
    title: 'Alle skjema med nøkkelinformasjon',
    contentType: 'text/csv',
    fileExtension: 'csv',
  },
  UNPUBLISHED_FORMS: {
    id: 'unpublished-forms',
    title: 'Avpubliserte skjema',
    contentType: 'text/csv',
    fileExtension: 'csv',
  },
  ALL_FORMS_AND_ATTACHMENTS: {
    id: 'all-forms-and-attachments',
    title: 'Alle skjema med vedlegg',
    contentType: 'text/csv',
    fileExtension: 'csv',
  },
};

class ReportService {
  constructor(private readonly dependencies: ReportDependencies) {}

  async generate(reportId: string, writableStream: Writable) {
    switch (reportId) {
      case ReportRegistry.FORMS_PUBLISHED_LANGUAGES.id:
        return writeCsvReport(reportId, publishedLanguagesReport(this.dependencies), writableStream);
      case ReportRegistry.ALL_FORMS_SUMMARY.id:
        return writeCsvReport(reportId, allFormsSummaryReport(this.dependencies), writableStream);
      case ReportRegistry.UNPUBLISHED_FORMS.id:
        return writeCsvReport(reportId, unpublishedFormsReport(this.dependencies), writableStream);
      case ReportRegistry.ALL_FORMS_AND_ATTACHMENTS.id:
        return writeCsvReport(reportId, attachmentsReport(this.dependencies), writableStream);
      default:
        throw new Error(`Report not implemented: ${reportId}`);
    }
  }

  getReportDefinition = (reportId: string) => Object.values(ReportRegistry).find((report) => report.id === reportId);

  getAllReports(): ReportDefinition[] {
    return Object.values(ReportRegistry).map((report) => ({ ...report }));
  }
}

export default ReportService;
