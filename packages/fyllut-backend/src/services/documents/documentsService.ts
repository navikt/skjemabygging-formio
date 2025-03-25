import {
  I18nTranslationMap,
  I18nTranslationReplacements,
  localizationUtils,
  NavFormType,
  Submission,
  translationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { base64Decode } from '../../utils/base64';
import { htmlResponseError } from '../../utils/errorHandling';
import applicationService from './applicationService';
import coverPageService from './coverPageService';
import { mergeFiles } from './gotenbergService';

interface ApplicationProps {
  accessToken: string;
  form: NavFormType;
  submissionMethod: string;
  submission: Submission;
  language: string;
  translations: I18nTranslationMap;
}

const application = async (props: CoverPageAndApplicationProps) => {
  const { accessToken, form, submission, language, translations, submissionMethod } = props;

  const applicationResponse: any = await applicationService.createPdf(
    accessToken,
    form,
    submission,
    submissionMethod,
    createTranslate(translations, language),
    language,
  );

  const applicationPdf = base64Decode(applicationResponse.data);

  if (applicationPdf === undefined) {
    throw htmlResponseError('Generering av søknads PDF feilet');
  }

  return Buffer.from(applicationPdf);
};

interface CoverPageAndApplicationProps extends ApplicationProps {
  unitNumber: string;
}

const coverPageAndApplication = async (props: CoverPageAndApplicationProps) => {
  const { accessToken, form, submission, language, unitNumber, translations, submissionMethod } = props;

  const coverPageResponse: any = await coverPageService.createPdf({
    accessToken,
    form,
    submission,
    translate: createTranslate(translations, language),
    language,
    unitNumber,
  });

  const coverPagePdf = base64Decode(coverPageResponse.foersteside);

  if (coverPagePdf === undefined) {
    throw htmlResponseError('Generering av førstesideark PDF feilet');
  }

  const applicationResponse: any = await applicationService.createPdf(
    accessToken,
    form,
    submission,
    submissionMethod,
    createTranslate(translations, language),
    language,
  );

  const applicationPdf = base64Decode(applicationResponse.data);

  if (applicationPdf === undefined) {
    throw htmlResponseError('Generering av søknads PDF feilet');
  }

  const documents = [coverPagePdf, applicationPdf];

  const mergedFile = await mergeFiles(
    coverPageResponse.navSkjemaId,
    coverPageResponse.overskriftstittel,
    language,
    documents,
    { pdfa: true, pdfua: true },
  );

  return Buffer.from(new Uint8Array(mergedFile));
};

const createTranslate = (translations: I18nTranslationMap, language: string) => {
  const languageCode = localizationUtils.getLanguageCodeAsIso639_1(language.toLowerCase());

  return (text: string, textReplacements?: I18nTranslationReplacements) =>
    translationUtils.translateWithTextReplacements({
      translations,
      originalText: text,
      params: textReplacements,
      currentLanguage: languageCode,
    });
};

const documentsService = {
  application,
  coverPageAndApplication,
};

export default documentsService;
