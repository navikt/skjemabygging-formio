import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { RequestHandler } from 'express';
import { reportService } from '../../../services';
import { ApiError } from '../helpers/errors';

const report: RequestHandler = async (req, res, next) => {
  const reportId = requestUtil.getStringParam(req, 'reportId')!;
  const report = reportService.getReportDefinition(reportId);
  if (!report) {
    throw new Error(`Report not implemented: ${reportId}`);
  }
  try {
    res.contentType(`${report.contentType}; charset=utf-8`);
    res.attachment(`${reportId}.${report.fileExtension}`);
    await reportService.generate(reportId, res);
  } catch (err) {
    // A pipeline failure destroys the response. Never append an error document to a partial download.
    if (res.headersSent || res.destroyed) {
      if (!res.destroyed) res.destroy();
      return;
    }
    next(new ApiError('Kunne ikke generere rapport', true, err as Error));
  }
};

export default report;
