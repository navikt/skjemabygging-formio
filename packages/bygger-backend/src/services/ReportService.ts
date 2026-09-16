import { ReportDefinition } from '@navikt/skjemadigitalisering-shared-domain';
import { Writable } from 'node:stream';
import { attachmentsReport } from './reports/attachments';
import { writeCsvReport } from './reports/csvPipeline';
import { publishedLanguagesReport } from './reports/publishedLanguages';
import { summaryReport } from './reports/summary';
import { ReportDependencies } from './reports/types';
import { unpublishedReport } from './reports/unpublished';

const ReportMap: Record<string, ReportDefinition> = {
  FORMS_PUBLISHED_LANGUAGES: {
    id: 'forms-published-languages',
    title: 'Publiserte språk per skjema',
    contentType: 'text/csv',
    fileEnding: 'csv',
  },
  ALL_FORMS_SUMMARY: {
    id: 'all-forms-summary',
    title: 'Alle skjema med nøkkelinformasjon',
    contentType: 'text/csv',
    fileEnding: 'csv',
  },
  UNPUBLISHED_FORMS: {
    id: 'unpublished-forms',
    title: 'Avpubliserte skjema',
    contentType: 'text/csv',
    fileEnding: 'csv',
  },
  ALL_FORMS_AND_ATTACHMENTS: {
    id: 'all-forms-and-attachments',
    title: 'Alle skjema med vedlegg',
    contentType: 'text/csv',
    fileEnding: 'csv',
  },
};

class ReportService {
  constructor(private readonly dependencies: ReportDependencies) {}

  async generate(reportId: string, writableStream: Writable) {
    switch (reportId) {
      case ReportMap.FORMS_PUBLISHED_LANGUAGES.id:
        return writeCsvReport(reportId, publishedLanguagesReport(this.dependencies), writableStream);
      case ReportMap.ALL_FORMS_SUMMARY.id:
        return writeCsvReport(reportId, summaryReport(this.dependencies), writableStream);
      case ReportMap.UNPUBLISHED_FORMS.id:
        return writeCsvReport(reportId, unpublishedReport(this.dependencies), writableStream);
      case ReportMap.ALL_FORMS_AND_ATTACHMENTS.id:
        return writeCsvReport(reportId, attachmentsReport(this.dependencies), writableStream);
      default:
        throw new Error(`Report not implemented: ${reportId}`);
    }
  }

  getReportDefinition = (reportId: string) => Object.values(ReportMap).find((report) => report.id === reportId);

  getAllReports(): ReportDefinition[] {
    return Object.values(ReportMap).map((report) => ({ ...report }));
  }
}

export default ReportService;
