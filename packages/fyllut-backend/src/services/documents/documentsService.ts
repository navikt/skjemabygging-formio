import {
  I18nTranslationMap,
  I18nTranslationReplacements,
  localizationUtils,
  NavFormType,
  Submission,
  translationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../logger';
import { createFeltMapFromSubmission } from '../../routers/api/helpers/feltMapBuilder';
import { stringifyPdf } from '../../routers/api/helpers/pdfUtils';
import { base64Decode } from '../../utils/base64';
import { htmlResponseError } from '../../utils/errorHandling';
import applicationService from './applicationService';
import coverPageService from './coverPageService';
import { mergeFrontPageAndApplication } from './mergeFilesService';

interface ApplicationProps {
  accessToken: string;
  form: NavFormType;
  pdfFormData?: any;
  submissionMethod: string;
  submission: Submission;
  language: string;
  translations: I18nTranslationMap;
}

const application = async (props: CoverPageAndApplicationProps) => {
  const { accessToken, form, pdfFormData, submission, language, translations, submissionMethod } = props;

  const applicationPdf = await applicationService.createFormPdf(
    accessToken,
    pdfFormData
      ? stringifyPdf(pdfFormData)
      : createFeltMapFromSubmission(
          form,
          submission,
          submissionMethod,
          createTranslate(translations, language),
          language,
        ),
  );

  if (applicationPdf === undefined) {
    throw htmlResponseError('Generering av søknads PDF feilet');
  }

  return Buffer.from(applicationPdf);
};

interface CoverPageAndApplicationProps extends ApplicationProps {
  pdfGeneratorAccessToken;
  mergePdfAccessToken: string;
  unitNumber: string;
}

const coverPageAndApplication = async (props: CoverPageAndApplicationProps) => {
  const {
    accessToken,
    pdfGeneratorAccessToken,
    form,
    pdfFormData,
    submission,
    language,
    unitNumber,
    translations,
    submissionMethod,
    mergePdfAccessToken,
  } = props;

  const [coverPageResponse, applicationResponse] = await Promise.all([
    coverPageService.createPdf({
      accessToken,
      form,
      submission,
      translate: createTranslate(translations, language),
      language,
      unitNumber,
    }),
    applicationService.createFormPdf(
      pdfGeneratorAccessToken,
      pdfFormData
        ? stringifyPdf(pdfFormData)
        : createFeltMapFromSubmission(
            form,
            submission,
            submissionMethod,
            createTranslate(translations, language),
            language,
          ),
    ),
  ]);

  const coverPagePdf = base64Decode(coverPageResponse.foersteside);

  if (coverPagePdf === undefined) {
    throw htmlResponseError('Generering av førstesideark PDF feilet');
  }

  const applicationPdf = applicationResponse;

  if (applicationPdf === undefined) {
    throw htmlResponseError('Generering av søknads PDF feilet');
  }

  const mergedFile = await mergeFrontPageAndApplication(
    mergePdfAccessToken,
    coverPageResponse.overskriftstittel,
    language,
    coverPagePdf,
    applicationPdf,
  );
  logger.info(`Request to merge front page and application completed`, {});

  if (mergedFile === undefined) {
    throw htmlResponseError('Sammenslåing av forside og søknad feilet');
  }

  return Buffer.from(new Uint8Array(mergedFile));
};

const createTranslate = (translations: I18nTranslationMap, language: string) => {
  const languageCode = localizationUtils.getLanguageCodeAsIso639_1(language.toLowerCase());

  return (text: string, textReplacements?: I18nTranslationReplacements) =>
    translationUtils.translateWithTextReplacements({
      translations,
      textOrKey: text,
      params: textReplacements,
      currentLanguage: languageCode,
    });
};

const documentsService = {
  application,
  coverPageAndApplication,
};

export default documentsService;
