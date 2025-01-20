import {
  I18nTranslationMap,
  Language,
  localizationUtils,
  NavFormType,
  Submission,
} from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { htmlResponseError } from '../../utils/errorHandling';
import { logErrorWithStacktrace } from '../../utils/errors';
import { createPdf } from './helpers/pdfService';

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

const gotenberg = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { form, submission, submissionMethod, translations, language } = parseBody(req);
      const languageCode = localizationUtils.getLanguageCodeAsIso639_1(language);

      const pdf = await createPdf(
        req.headers.AzureAccessToken as string,
        form,
        submission,
        submissionMethod,
        translations,
        languageCode,
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.send(Buffer.from(new Uint8Array(pdf)));
    } catch (e) {
      logErrorWithStacktrace(e as Error);
      const createPdfError = htmlResponseError('Generering av PDF feilet');
      next(createPdfError);
    }
  },
};

export default gotenberg;
