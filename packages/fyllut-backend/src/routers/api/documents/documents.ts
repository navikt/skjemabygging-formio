import { RequestHandler } from 'express';
import documentsService from '../../../services/documents/documentsService';
import { htmlResponseError } from '../../../utils/errorHandling';
import { logErrorWithStacktrace } from '../../../utils/errors';

const coverPageAndApplication: RequestHandler = async (req, res, next) => {
  try {
    const { form, submission, language, enhetNummer, submissionMethod, translations } = req.body;
    const formParsed = JSON.parse(form);
    const submissionParsed = JSON.parse(submission);

    const fileBuffer = await documentsService.coverPageAndApplication({
      form: formParsed,
      submission: submissionParsed,
      language,
      unitNumber: enhetNummer,
      accessToken: req.headers.AzureAccessToken as string,
      submissionMethod,
      translations,
    });
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(`${formParsed.path}.pdf`)}`);
    res.send(fileBuffer);
  } catch (e) {
    logErrorWithStacktrace(e as Error);
    next(htmlResponseError('Generering av førstesideark eller soknads PDF feilet'));
  }
};

const documents = {
  coverPageAndApplication,
};

export default documents;
