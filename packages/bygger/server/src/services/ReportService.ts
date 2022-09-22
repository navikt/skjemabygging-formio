import { stringify } from "csv-stringify";
import { Writable } from "stream";
import { FormioService } from "./formioService";

export interface Report {
  id: string;
  title: string;
  contentType: string;
  fileEnding: "csv";
}

const ReportMap: Record<string, Report> = {
  FORMS_PUBLISHED_LANGUAGES: {
    id: "forms-published-languages",
    title: "Publiserte språk per skjema",
    contentType: "text/csv",
    fileEnding: "csv",
  },
};

class ReportService {
  private readonly formioService: FormioService;

  constructor(formioService: FormioService) {
    this.formioService = formioService;
  }

  async generate(report: Report, writableStream: Writable) {
    switch (report) {
      case ReportMap.FORMS_PUBLISHED_LANGUAGES:
        return this.generateFormsPublishedLanguage(writableStream);
      default:
        throw new Error(`Report not implemented: ${report.id}`);
    }
  }

  getReportType = (reportId: string) => Object.values(ReportMap).find((report) => report.id === reportId);

  getAllReports(): Report[] {
    return Object.keys(ReportMap).map((key) => ({ ...ReportMap[key] }));
  }

  async generateFormsPublishedLanguage(writableStream: Writable) {
    const columns = ["skjemanummer", "skjematittel", "språk"];
    const publishedForms = await this.formioService.getPublishedForms("title,properties");
    const stringifier = stringify({ header: true, columns, delimiter: ";" });
    stringifier.pipe(writableStream);
    publishedForms
      .filter((form) => !form.properties.isTestForm)
      .forEach((form) => {
        const { title, properties } = form;
        const publishedLanguages = properties.publishedLanguages?.join(",") || "";
        stringifier.write([properties.skjemanummer, title, publishedLanguages]);
      });
    stringifier.end();
  }
}

export default ReportService;
