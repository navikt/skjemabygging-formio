import { RequestHandler } from 'express';
import { appMetrics } from '../../../services';
import documentsService from '../../../services/documents/documentsService';
import { LogMetadata } from '../../../types/log';

const application: RequestHandler = async (req, res, next) => {
  try {
    const { form, pdfFormData, submission, language, enhetNummer, submissionMethod, translations } = req.body;
    if (!submission) {
      throw new Error('Missing submission data to generate PDF');
    }
    const formParsed = JSON.parse(form);
    const submissionParsed = JSON.parse(submission);
    const translationsParsed = JSON.parse(translations);
    const pdfGeneratorToken = req.headers.PdfAccessToken as string;

    if (!pdfGeneratorToken) {
      throw new Error('Azure PDF generator token is missing. Unable to generate PDF');
    }

    const logMeta: LogMetadata = {
      skjemanummer: formParsed?.properties?.skjemanummer,
      language,
      fyllutRequestPath: req.path,
    };
    const fileBuffer = await documentsService.application(
      {
        form: formParsed,
        pdfFormData,
        submission: submissionParsed,
        language,
        unitNumber: enhetNummer,
        accessToken: pdfGeneratorToken,
        pdfGeneratorAccessToken: pdfGeneratorToken,
        mergePdfAccessToken: req.headers.MergePdfToken as string,
        submissionMethod,
        translations: translationsParsed,
      },
      logMeta,
    );
    appMetrics.paperSubmissionsCounter.inc({ source: 'ingen' });
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(`${formParsed.path}.pdf`)}`);
    res.send(fileBuffer);
  } catch (e) {
    next(e);
  }
};

const coverPageAndApplication: RequestHandler = async (req, res, next) => {
  try {
    const { form, submission, language, enhetNummer, submissionMethod, translations, pdfFormData } = req.body;
    if (!submission) {
      throw new Error('Missing submission data to generate PDF');
    }
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
    const logMeta: LogMetadata = {
      skjemanummer: formParsed?.properties?.skjemanummer,
      language,
      fyllutRequestPath: req.path,
    };
    const fileBuffer = await documentsService.coverPageAndApplication(
      {
        form: formParsed,
        pdfFormData,
        submission: submissionParsed,
        language,
        unitNumber: enhetNummer,
        accessToken: frontPageGeneratorToken,
        pdfGeneratorAccessToken: pdfGeneratorToken,
        mergePdfAccessToken: mergePdfToken,
        submissionMethod,
        translations: translationsParsed,
      },
      logMeta,
    );
    appMetrics.paperSubmissionsCounter.inc({ source: 'fyllUt' });
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(`${formParsed.path}.pdf`)}`);
    res.send(fileBuffer);
  } catch (e) {
    next(e);
  }
};

const documents = {
  application,
  coverPageAndApplication,
};

export default documents;
