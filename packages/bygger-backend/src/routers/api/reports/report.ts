import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { RequestHandler } from 'express';
import { Writable } from 'node:stream';
import { reportService } from '../../../services';

const report: RequestHandler = async (req, res) => {
  const reportId = requestUtil.getStringParam(req, 'reportId')!;
  const report = reportService.getReportDefinition(reportId);
  if (!report) {
    throw new Error(`Report not implemented: ${reportId}`);
  }
  // Let the pipeline destroy its sink without closing an HTTP response that has not started.
  const output = new Writable({
    write(chunk, encoding, callback) {
      res.write(chunk, encoding, callback);
    },
    final(callback) {
      res.end(callback);
    },
    destroy(error, callback) {
      if (res.headersSent && !res.writableFinished) res.destroy();
      callback(error);
    },
  });
  const cancelOnClose = () => {
    if (!res.writableFinished) output.destroy();
  };
  const failOnError = (error: Error) => output.destroy(error);
  res.once('close', cancelOnClose);
  res.once('error', failOnError);
  if (res.destroyed) output.destroy();

  try {
    res.contentType(`${report.contentType}; charset=utf-8`);
    res.attachment(`${reportId}.${report.fileExtension}`);
    await reportService.generate(reportId, output);
  } catch {
    if (res.headersSent || res.destroyed) {
      if (!res.destroyed) res.destroy();
      return;
    }
    res.removeHeader('Content-Disposition');
    res.removeHeader('Content-Type');
    // The report pipeline has already logged the failure with context; the shared handler would log it again.
    res.status(500).json({ message: 'Kunne ikke generere rapport', functional: true });
  } finally {
    res.off('close', cancelOnClose);
    res.off('error', failOnError);
  }
};

export default report;
