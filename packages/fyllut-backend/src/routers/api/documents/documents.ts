import { RequestHandler } from 'express';
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
      accessToken: req.headers.AzurePdfGeneratorToken as string,
      pdfGeneratorAccessToken: req.headers.AzurePdfGeneratorToken as string,
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

    console.log(req.headers);

    if (!frontPageGeneratorToken) {
      throw new Error('Azure access token is missing. Unable to generate PDF');
    }

    if (!pdfGeneratorToken) {
      throw new Error('PDF generator token is missing. Unable to generate PDF');
    }

    const fileBuffer = await documentsService.coverPageAndApplication({
      form: formParsed,
      submission: submissionParsed,
      language,
      unitNumber: enhetNummer,
      accessToken: frontPageGeneratorToken,
      pdfGeneratorAccessToken: pdfGeneratorToken,
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

const pdfFromFieldMap: RequestHandler = async (req, res, next) => {
  try {
    const { form, submission, language, enhetNummer, submissionMethod, translations } = req.body;
    const formParsed = JSON.parse(form);
    const submissionParsed = JSON.parse(submission);
    const translationsParsed = JSON.parse(translations);

    const fileBuffer = await documentsService.coverPageAndApplication({
      form: formParsed,
      submission: submissionParsed,
      language,
      unitNumber: enhetNummer,
      accessToken: req.headers.AzureAccessToken as string,
      pdfGeneratorAccessToken: req.headers.AzurePdfGeneratorToken as string,
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

const documents = {
  application,
  coverPageAndApplication,
  pdfFromFieldMap,
};

export default documents;
