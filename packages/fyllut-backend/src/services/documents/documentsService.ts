import { I18nTranslationMap, NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { base64Decode } from '../../utils/base64';
import { htmlResponseError } from '../../utils/errorHandling';
import applicationService from './applicationService';
import frontPageService from './frontPageService';
import { mergeFiles } from './gotenbergService';

interface FrontPageAndApplicationProps {
  accessToken: string;
  form: NavFormType;
  submissionMethod: string;
  submission: Submission;
  language: string;
  translations: I18nTranslationMap;
  unitNumber: string;
}

const frontPageAndApplication = async (props: FrontPageAndApplicationProps) => {
  const { accessToken, form, submission, language, unitNumber, translations, submissionMethod } = props;

  const frontPageResponse: any = await frontPageService.createPdf({
    accessToken,
    form,
    submission,
    language,
    unitNumber,
  });

  const frontPagePdf = base64Decode(frontPageResponse.foersteside);

  if (frontPagePdf === undefined) {
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

  const documents = [frontPagePdf, applicationPdf];

  const mergedFile = await mergeFiles(
    frontPageResponse.navSkjemaId,
    frontPageResponse.overskriftstittel,
    frontPageResponse.spraakkode,
    documents,
    { pdfa: true, pdfua: true },
  );

  return Buffer.from(new Uint8Array(mergedFile));
};

const documentsService = {
  frontPageAndApplication,
};

export default documentsService;
