import { formioService } from "./index";
import ReportService from "./ReportService";

describe("ReportService", () => {
  let reportService: ReportService;

  beforeEach(() => {
    reportService = new ReportService(formioService);
  });

  it("returns list containing report metadata", () => {
    const allReports = reportService.getAllReports();
    const report = allReports.find((report) => report.id === "forms-published-languages");
    expect(report).toBeDefined();
    expect(report?.title).toEqual("Publiserte språk per skjema");
    expect(report?.contentType).toEqual("text/csv");
  });
});
