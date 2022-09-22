import { RequestHandler } from "express";
import { reportService } from "../../../services";
import { ApiError } from "../helpers/errors";

const report: RequestHandler = async (req, res, next) => {
  const { reportId } = req.params;
  const report = reportService.getReportType(reportId);
  if (!report) {
    throw new Error(`Report not implemented: ${reportId}`);
  }
  try {
    res.contentType(report.contentType);
    res.attachment(`${reportId}.${report.fileEnding}`);
    await reportService.generate(report, res);
  } catch (err) {
    next(new ApiError("Kunne ikke generere rapport", true, err as Error));
  }
};

export default report;
