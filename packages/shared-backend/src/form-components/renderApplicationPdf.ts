import {
  Form,
  FormsApiTranslationMap,
  formsApiTranslationUtils,
  navFormUtils,
  PdfFormData,
  ResponseError,
  Submission,
  SubmissionMethod,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import renderPdfForm from './RenderPdfForm';
import { withResolvedSubmissionAttachments } from './resolveSubmissionAttachments';
import { PdfRendererAppConfig } from './types';

interface RenderApplicationPdfProps {
  form: Form;
  submission: Submission;
  language: TranslationLang;
  translations: FormsApiTranslationMap;
  submissionMethod?: SubmissionMethod;
  appConfig?: PdfRendererAppConfig;
}

const renderApplicationPdf = ({
  form,
  submission,
  language,
  translations,
  submissionMethod,
  appConfig,
}: RenderApplicationPdfProps): PdfFormData | undefined => {
  if (!submission) {
    throw new ResponseError('BAD_REQUEST', 'Missing submission to generate PDF');
  }

  const translate = formsApiTranslationUtils.createTranslate(translations, language);

  const normalizedSubmission = withResolvedSubmissionAttachments(form, submission);
  const activeComponents = navFormUtils.getAllActivePanelsFromForm(form, normalizedSubmission);

  return renderPdfForm({
    activeComponents,
    submission: normalizedSubmission,
    form,
    currentLanguage: language,
    translate,
    submissionMethod,
    appConfig: appConfig ?? {},
  });
};

export default renderApplicationPdf;
