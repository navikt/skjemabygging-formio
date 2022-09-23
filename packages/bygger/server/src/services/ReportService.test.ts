import { FormPropertiesType, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import MemoryStream from "memorystream";
import nock from "nock";
import config from "../config";
import { formioService } from "./index";
import ReportService from "./ReportService";

describe("ReportService", () => {
  let reportService: ReportService;

  beforeEach(() => {
    reportService = new ReportService(formioService);
  });

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  it("returns list containing report metadata", () => {
    const allReports = reportService.getAllReports();
    const report = allReports.find((report) => report.id === "forms-published-languages");
    expect(report).toBeDefined();
    expect(report?.title).toEqual("Publiserte språk per skjema");
    expect(report?.contentType).toEqual("text/csv");
  });

  describe("getReportDefinition", () => {
    it("returns report definition for given id", () => {
      const reportDefinition = reportService.getReportDefinition("forms-published-languages");
      expect(reportDefinition).toBeDefined();
      expect(reportDefinition?.title).toEqual("Publiserte språk per skjema");
    });

    it("returns undefined when id is unknown", () => {
      const reportDefinition = reportService.getReportDefinition("unknown-report-id");
      expect(reportDefinition).toBeUndefined();
    });
  });

  describe("generateFormsPublishedLanguage", () => {
    const CSV_HEADER_LINE = "skjemanummer;skjematittel;språk\n";

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

    it("includes published forms with its respective languages", async () => {
      const publishedForms = [
        {
          title: "Testskjema1",
          properties: {
            skjemanummer: "TEST1",
            published: "2022-07-28T10:00:10.325Z",
            publishedLanguages: ["en", "nn-NO"],
          } as FormPropertiesType,
        },
        {
          title: "Testskjema2",
          properties: {
            skjemanummer: "TEST2",
            published: "2022-07-28T10:00:10.325Z",
            publishedLanguages: ["en"],
          } as FormPropertiesType,
        },
        {
          title: "Testskjema3",
          properties: {
            skjemanummer: "TEST3",
            published: "2022-07-28T10:00:10.325Z",
            publishedLanguages: undefined,
          } as FormPropertiesType,
        },
      ];
      setupNock(publishedForms);

      const writableStream = createWritableStream();
      await reportService.generate("forms-published-languages", writableStream);
      expect(writableStream.toString()).toEqual(
        CSV_HEADER_LINE + "TEST1;Testskjema1;en,nn-NO\nTEST2;Testskjema2;en\nTEST3;Testskjema3;\n"
      );
    });

    it("does not include testform", async () => {
      const publishedForms = [
        {
          title: "Testskjema1",
          properties: {
            skjemanummer: "TEST1",
            published: "2022-07-28T10:00:10.325Z",
            publishedLanguages: ["en", "nn-NO"],
          } as FormPropertiesType,
        },
        {
          title: "Testskjema2",
          properties: {
            skjemanummer: "TEST2",
            published: "2022-07-28T10:00:10.325Z",
            publishedLanguages: ["en"],
            isTestForm: true, // <- testform
          } as FormPropertiesType,
        },
      ];
      setupNock(publishedForms);

      const writableStream = createWritableStream();
      await reportService.generate("forms-published-languages", writableStream);
      expect(writableStream.toString()).toEqual(CSV_HEADER_LINE + "TEST1;Testskjema1;en,nn-NO\n");
    });

    it("fails if unknown report", async () => {
      let errorCatched = false;
      const writableStream = createWritableStream();
      try {
        await reportService.generate("unknown-report-id", writableStream);
      } catch (err) {
        errorCatched = true;
      }
      expect(errorCatched).toBe(true);
    });
  });
});
