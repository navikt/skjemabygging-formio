import {
  Form,
  FormsApiTranslationMap,
  navFormUtils,
  PdfFormData,
  Submission,
  SubmissionMethod,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import translationUtil from '../util/translation/translationUtil';
import renderPdfForm from './RenderPdfForm';
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
  const translate = translationUtil.createTranslate(translations, language);

  const activeComponents = navFormUtils.getActiveComponentsFromForm(form, submission);
  const activeAttachmentUploadsPanel = navFormUtils.getActiveAttachmentPanelFromForm(form, submission);

  return renderPdfForm({
    activeComponents,
    activeAttachmentUploadsPanel,
    submission,
    form,
    currentLanguage: language,
    translate,
    submissionMethod,
    appConfig: appConfig ?? {},
  });
};

export default renderApplicationPdf;
