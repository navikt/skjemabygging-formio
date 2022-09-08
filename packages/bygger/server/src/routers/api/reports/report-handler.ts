import { RequestHandler } from "express";
import { reportService } from "../../../services";
import { Report } from "../../../services/ReportService";
import { ApiError } from "../helpers/errors";

const reportHandler =
  (report: Report): RequestHandler =>
  async (req, res, next) => {
    try {
      res.contentType("text/csv");
      res.attachment(`${report}.csv`);
      await reportService.generate(report, res);
    } catch (err) {
      next(new ApiError("Kunne ikke generere rapport", true, err as Error));
    }
  };

export default reportHandler;
