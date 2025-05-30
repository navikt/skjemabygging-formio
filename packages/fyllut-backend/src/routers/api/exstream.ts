import { I18nTranslationMap, Language, NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import documentsService from '../../services/documents/documentsService';
import { htmlResponseError } from '../../utils/errorHandling';
import { logErrorWithStacktrace } from '../../utils/errors';

const parseBody = (
  req: Request,
): {
  form: NavFormType;
  submission: Submission;
  submissionMethod: string;
  translations: I18nTranslationMap;
  language: Language;
} => {
  const submission = JSON.parse(req.body.submission);
  const submissionMethod = req.body.submissionMethod;
  const form = JSON.parse(req.body.form);
  const translations = JSON.parse(req.body.translations);
  const language = req.body.language;
  return { form, submission, submissionMethod, translations, language };
};

export const getPdf = async (req: Request) => {
  const { form, submission, submissionMethod, translations, language } = parseBody(req);

  return await documentsService.application({
    form: form,
    submission: submission,
    language,
    unitNumber: '',
    accessToken: req.headers.AzureAccessToken as string,
    submissionMethod,
    translations: translations,
  });
};

const exstream = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pdf = await getPdf(req);
      if (!pdf) {
        const createPdfError = htmlResponseError('Generering av PDF feilet');
        next(createPdfError);
      }
      res.contentType('application/pdf');
      res.send(pdf);
    } catch (e) {
      logErrorWithStacktrace(e as Error);
      const createPdfError = htmlResponseError('Generering av PDF feilet');
      next(createPdfError);
    }
  },
};

export default exstream;
