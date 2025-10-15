import { RequestHandler } from 'express';
import { appMetrics } from '../../../services';
import documentsService from '../../../services/documents/documentsService';
import { logErrorWithStacktrace } from '../../../utils/errors';

const application: RequestHandler = async (req, res, next) => {
  try {
    const { form, submission, language, enhetNummer, submissionMethod, translations } = req.body;
    const formParsed = JSON.parse(form);
    const submissionParsed = JSON.parse(submission);
    const translationsParsed = JSON.parse(translations);
    const pdfGeneratorToken = req.headers.PdfAccessToken as string;

    if (!pdfGeneratorToken) {
      throw new Error('Azure PDF generator token is missing. Unable to generate PDF');
    }

    const fileBuffer = await documentsService.application({
      form: formParsed,
      submission: submissionParsed,
      language,
      unitNumber: enhetNummer,
      accessToken: pdfGeneratorToken,
      pdfGeneratorAccessToken: pdfGeneratorToken,
      mergePdfAccessToken: req.headers.MergePdfToken as string,
      submissionMethod,
      translations: translationsParsed,
    });
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(`${formParsed.path}.pdf`)}`);
    res.send(fileBuffer);
  } catch (e) {
    logErrorWithStacktrace(e as Error);
    next(e);
  }
};

const coverPageAndApplication: RequestHandler = async (req, res, next) => {
  try {
    const { form, submission, language, enhetNummer, submissionMethod, translations } = req.body;
    const formParsed = JSON.parse(form);
    const submissionParsed = JSON.parse(submission);
    const translationsParsed = JSON.parse(translations);
    const frontPageGeneratorToken = req.headers.AzureAccessToken as string;
    const pdfGeneratorToken = req.headers.PdfAccessToken as string;
    const mergePdfToken = req.headers.MergePdfToken as string;

    if (!frontPageGeneratorToken) {
      throw new Error('Azure access token is missing. Unable to generate PDF');
    }

    if (!pdfGeneratorToken) {
      throw new Error('PDF generator token is missing. Unable to generate PDF');
    }

    if (!mergePdfToken) {
      throw new Error('MergePDF generator token is missing. Unable to merge front page and application PDFs');
    }

    const fileBuffer = await documentsService.coverPageAndApplication({
      form: formParsed,
      submission: submissionParsed,
      language,
      unitNumber: enhetNummer,
      accessToken: frontPageGeneratorToken,
      pdfGeneratorAccessToken: pdfGeneratorToken,
      mergePdfAccessToken: mergePdfToken,
      submissionMethod,
      translations: translationsParsed,
    });
    appMetrics.paperSubmissionsCounter.inc({ source: 'fyllUt' });
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(`${formParsed.path}.pdf`)}`);
    res.send(fileBuffer);
  } catch (e) {
    logErrorWithStacktrace(e as Error);
    next(e);
  }
};

const documents = {
  application,
  coverPageAndApplication,
};

export default documents;
