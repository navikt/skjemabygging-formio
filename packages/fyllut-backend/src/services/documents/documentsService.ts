import { pdfFormDataService } from '@navikt/skjemadigitalisering-shared-backend';
import {
  localizationUtils,
  NavFormType,
  Submission,
  translationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { stringifyPdf } from '../../routers/api/helpers/pdfUtils';
import { LogMetadata } from '../../types/log';
import { base64Decode } from '../../utils/base64';
import TranslationsService from '../TranslationsService';
import applicationService from './applicationService';
import coverPageService from './coverPageService';
import { mergeFrontPageAndApplication } from './mergeFilesService';

const translationsService = new TranslationsService(config);

interface ApplicationProps {
  accessToken: string;
  form: NavFormType;
  submissionMethod: string;
  submission: Submission;
  language: string;
}

const application = async (props: CoverPageAndApplicationProps, logMeta: LogMetadata = {}) => {
  const { accessToken, form, submission, language, submissionMethod } = props;
  const translate = await createTranslate(form.path, language);

  const applicationPdf = await applicationService.createFormPdf(
    accessToken,
    stringifyPdf(
      pdfFormDataService.createPdfFormDataFromSubmission({
        form,
        submission,
        submissionMethod,
        translate,
        language,
        gitVersion: config.gitVersion,
        isDelingslenke: config.isDelingslenke,
      }),
    ),
    logMeta,
  );

  if (applicationPdf === undefined) {
    throw new Error('Generering av søknads PDF feilet');
  }

  return Buffer.from(applicationPdf);
};

interface CoverPageAndApplicationProps extends ApplicationProps {
  pdfGeneratorAccessToken: string;
  mergePdfAccessToken: string;
  unitNumber: string;
}

const coverPageAndApplication = async (props: CoverPageAndApplicationProps, logMeta: LogMetadata = {}) => {
  const {
    accessToken,
    pdfGeneratorAccessToken,
    form,
    submission,
    language,
    unitNumber,
    submissionMethod,
    mergePdfAccessToken,
  } = props;
  const translate = await createTranslate(form.path, language);

  const [coverPageResponse, applicationResponse] = await Promise.all([
    coverPageService.createPdf({
      accessToken,
      form,
      submission,
      translate,
      language,
      unitNumber,
      logMeta,
    }),
    applicationService.createFormPdf(
      pdfGeneratorAccessToken,
      stringifyPdf(
        pdfFormDataService.createPdfFormDataFromSubmission({
          form,
          submission,
          submissionMethod,
          translate,
          language,
          gitVersion: config.gitVersion,
          isDelingslenke: config.isDelingslenke,
        }),
      ),
      logMeta,
    ),
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

const createTranslate = async (formPath: string, language: string) => {
  const normalizedLanguage = localizationUtils.getLanguageCodeAsIso639_1(language.toLowerCase());
  return translationUtils.createTranslate(
    await translationsService.getTranslationsForLanguage(formPath, normalizedLanguage),
    normalizedLanguage,
  );
};

const documentsService = {
  application,
  coverPageAndApplication,
};

export default documentsService;
