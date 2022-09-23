import { ReportDefinition } from "@navikt/skjemadigitalisering-shared-domain";
import { stringify } from "csv-stringify";
import { Writable } from "stream";
import { FormioService } from "./formioService";

const ReportMap: Record<string, ReportDefinition> = {
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

  async generate(reportId: string, writableStream: Writable) {
    switch (reportId) {
      case ReportMap.FORMS_PUBLISHED_LANGUAGES.id:
        return this.generateFormsPublishedLanguage(writableStream);
      default:
        throw new Error(`Report not implemented: ${reportId}`);
    }
  }

  getReportDefinition = (reportId: string) => Object.values(ReportMap).find((report) => report.id === reportId);

  getAllReports(): ReportDefinition[] {
    return Object.keys(ReportMap).map((key) => ({ ...ReportMap[key] }));
  }

  private async generateFormsPublishedLanguage(writableStream: Writable) {
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
