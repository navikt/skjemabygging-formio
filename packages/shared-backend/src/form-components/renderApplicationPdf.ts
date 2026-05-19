import {
  formioFormsApiUtils,
  I18nTranslationMap,
  NavFormType,
  navFormUtils,
  PdfFormData,
  Submission,
  SubmissionMethod,
  translationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import renderPdfForm from './RenderPdfForm';
import { PdfRendererAppConfig } from './types';

interface RenderApplicationPdfProps {
  form: NavFormType;
  submission: Submission;
  language: string;
  translations?: I18nTranslationMap;
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
  const baseTranslate = translationUtils.createTranslate(translations ?? {}, language);
  const translate = (text: string | undefined, textReplacements?: Record<string, string>) =>
    text ? `${baseTranslate(text, textReplacements)}` : '';

  const activeComponents = navFormUtils.getActiveComponentsFromForm(form, submission);
  const activeAttachmentUploadsPanel =
    submissionMethod !== 'digital' ? navFormUtils.getActiveAttachmentPanelFromForm(form, submission) : undefined;

  return renderPdfForm({
    activeComponents,
    activeAttachmentUploadsPanel,
    submission,
    form: formioFormsApiUtils.mapNavFormToForm(form),
    currentLanguage: language,
    translate,
    submissionMethod,
    appConfig: appConfig ?? {},
  });
};

export default renderApplicationPdf;
