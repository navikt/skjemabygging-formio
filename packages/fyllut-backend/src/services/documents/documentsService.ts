import {
  I18nTranslationMap,
  I18nTranslationReplacements,
  localizationUtils,
  NavFormType,
  PdfFormData,
  Submission,
  translationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../logger';
import { stringifyPdf } from '../../routers/api/helpers/pdfUtils';
import { LogMetadata } from '../../types/log';
import { base64Decode } from '../../utils/base64';
import applicationService from './applicationService';
import coverPageService from './coverPageService';
import { mergeFrontPageAndApplication } from './mergeFilesService';

interface ApplicationProps {
  accessToken: string;
  pdfFormData: PdfFormData;
}

const application = async (props: CoverPageAndApplicationProps, logMeta: LogMetadata = {}) => {
  const { accessToken, pdfFormData } = props;
  const stringifiedPdfFormData = stringifyPdf(pdfFormData);

  const applicationPdf = await applicationService.createFormPdf(accessToken, stringifiedPdfFormData, logMeta);

  if (applicationPdf === undefined) {
    throw new Error('Generering av søknads PDF feilet');
  }

  return Buffer.from(applicationPdf);
};

interface CoverPageAndApplicationProps extends ApplicationProps {
  form: NavFormType;
  submission: Submission;
  language: string;
  translations: I18nTranslationMap;
  pdfGeneratorAccessToken: string;
  mergePdfAccessToken: string;
  unitNumber: string;
}

const coverPageAndApplication = async (props: CoverPageAndApplicationProps, logMeta: LogMetadata = {}) => {
  const {
    accessToken,
    pdfGeneratorAccessToken,
    form,
    pdfFormData,
    submission,
    language,
    unitNumber,
    translations,
    mergePdfAccessToken,
  } = props;
  const stringifiedPdfFormData = stringifyPdf(pdfFormData);

  const [coverPageResponse, applicationResponse] = await Promise.all([
    coverPageService.createPdf({
      accessToken,
      form,
      submission,
      translate: createTranslate(translations, language),
      language,
      unitNumber,
      logMeta,
    }),
    applicationService.createFormPdf(pdfGeneratorAccessToken, stringifiedPdfFormData, logMeta),
  ]);

  const coverPagePdf = base64Decode(coverPageResponse.foersteside);

  if (coverPagePdf === undefined) {
    throw Error('Generering av førstesideark PDF feilet');
  }

  const applicationPdf = applicationResponse;

  if (applicationPdf === undefined) {
    throw Error('Generering av søknads PDF feilet');
  }

  const mergedFile = await mergeFrontPageAndApplication(
    mergePdfAccessToken,
    coverPageResponse.overskriftstittel,
    language,
    coverPagePdf,
    applicationPdf,
    logMeta,
  );
  logger.info('Request to merge front page and application completed', logMeta);

  if (mergedFile === undefined) {
    throw Error('Sammenslåing av forside og søknad feilet');
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
