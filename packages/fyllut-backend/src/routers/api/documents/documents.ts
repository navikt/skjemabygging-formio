import { RequestHandler } from 'express';
import documentsService from '../../../services/documents/documentsService';
import { htmlResponseError } from '../../../utils/errorHandling';
import { logErrorWithStacktrace } from '../../../utils/errors';

const frontPage: RequestHandler = async (req, res, next) => {
  try {
    const { form, submission, language, enhetNummer } = req.body;
    const formParsed = JSON.parse(form);
    const submissionParsed = JSON.parse(submission);

    const fileBuffer = await documentsService.frontPage({
      form: formParsed,
      submission: submissionParsed,
      language,
      unitNumber: enhetNummer,
      accessToken: req.headers.AzureAccessToken as string,
    });
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(`søknad-${formParsed.path}.pdf`)}`);
    res.send(fileBuffer);
  } catch (e) {
    logErrorWithStacktrace(e as Error);
    next(htmlResponseError('Generering av førstesideark eller soknads PDF feilet'));
  }
};

const frontPageAndApplication: RequestHandler = async (req, res, next) => {
  try {
    const { form, submission, language, enhetNummer, submissionMethod, translations } = req.body;
    const formParsed = JSON.parse(form);
    const submissionParsed = JSON.parse(submission);

    const fileBuffer = await documentsService.frontPageAndApplication({
      form: formParsed,
      submission: submissionParsed,
      language,
      unitNumber: enhetNummer,
      accessToken: req.headers.AzureAccessToken as string,
      submissionMethod,
      translations,
    });
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(`søknad-${formParsed.path}.pdf`)}`);
    res.send(fileBuffer);
  } catch (e) {
    logErrorWithStacktrace(e as Error);
    next(htmlResponseError('Generering av førstesideark eller soknads PDF feilet'));
  }
};

const documents = {
  frontPage,
  frontPageAndApplication,
};

export default documents;
