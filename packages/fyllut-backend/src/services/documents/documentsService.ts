import { I18nTranslationMap, NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { base64Decode } from '../../utils/base64';
import { htmlResponseError } from '../../utils/errorHandling';
import applicationService from './applicationService';
import coverPageService from './coverPageService';
import { mergeFiles } from './gotenbergService';

interface CoverPageAndApplicationProps {
  accessToken: string;
  form: NavFormType;
  submissionMethod: string;
  submission: Submission;
  language: string;
  translations: I18nTranslationMap;
  unitNumber: string;
}

const coverPageAndApplication = async (props: CoverPageAndApplicationProps) => {
  const { accessToken, form, submission, language, unitNumber, translations, submissionMethod } = props;

  const coverPageResponse: any = await coverPageService.createPdf({
    accessToken,
    form,
    submission,
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
    translations,
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
    coverPageResponse.spraakkode,
    documents,
    { pdfa: true, pdfua: true },
  );

  return Buffer.from(new Uint8Array(mergedFile));
};

const documentsService = {
  coverPageAndApplication,
};

export default documentsService;
