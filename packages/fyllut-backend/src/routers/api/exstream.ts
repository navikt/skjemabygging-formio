import {
  I18nTranslationMap,
  Language,
  localizationUtils,
  NavFormType,
  Submission,
  SummaryPanel,
} from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { base64Decode } from '../../utils/base64';
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
  summaryPanels: SummaryPanel[];
} => {
  const submission = JSON.parse(req.body.submission);
  const submissionMethod = req.body.submissionMethod;
  const form = JSON.parse(req.body.form);
  const translations = JSON.parse(req.body.translations);
  const summaryPanels = req.body.summaryPanels ? JSON.parse(req.body.summaryPanels) : undefined;
  const language = req.body.language;
  return { form, submission, submissionMethod, translations, language, summaryPanels };
};

const exstream = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { form, submission, submissionMethod, translations, language, summaryPanels } = parseBody(req);
      const languageCode = localizationUtils.getLanguageCodeAsIso639_1(language);

      const pdf = await createPdf(
        req.headers.AzureAccessToken as string,
        form,
        submission,
        submissionMethod,
        translations,
        languageCode,
        summaryPanels,
      );
      res.contentType(pdf.contentType);
      res.send(base64Decode(pdf.data));
    } catch (e) {
      logErrorWithStacktrace(e as Error);
      const createPdfError = htmlResponseError('Generering av PDF feilet');
      next(createPdfError);
    }
  },
};

export default exstream;
