import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Form, navFormUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import {
  FormButtonRow,
  FormErrorSummary,
  FormNextButton,
  FormPrevButton,
  RenderInputForm,
  useFormDefinition,
  useSubmissionState,
  useValidation,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useEffect, useMemo } from 'react';
import AttachmentUploadPage from '../attachment-upload/AttachmentUploadPage';
import FormSecondaryButtons from '../FormSecondaryButtons';
import { ATTACHMENTS_KEY } from './constants';
import { useWizardNavigation } from './useWizardNavigation';

const AttachmentStep = ({ form }: { form: Form }) => {
  const { translate } = useLanguages();
  const { submissionMethod } = useAppConfig();
  const { form: formDefinition, panels } = useFormDefinition();
  const { submission } = useSubmissionState();
  const { syncPageValidationState, validatePage } = useValidation();
  const { goToPanel, goToSummary, goToError } = useWizardNavigation('attachment');
  const attachmentPanel = navFormUtils.getActiveAttachmentPanelFromForm(formDefinition, submission);
  const components = useMemo(() => attachmentPanel?.components ?? [], [attachmentPanel]);
  const attachmentPageKey = attachmentPanel?.key ?? ATTACHMENTS_KEY;
  const navigationRole = form.path === 'newrender' ? 'button' : 'link';
  const nextLabel =
    submissionMethod === 'digital' && form.path !== 'newrender'
      ? TEXTS.grensesnitt.navigation.saveAndContinue
      : TEXTS.grensesnitt.navigation.next;
  const hasUploadComponents = useMemo(
    () => navFormUtils.flattenComponents(components).some((component) => component.type === 'attachment'),
    [components],
  );
  const usesUploadPage =
    (submissionMethod === 'digital' || submissionMethod === 'digitalnologin') && hasUploadComponents;

  useEffect(() => {
    if (attachmentPanel && !usesUploadPage) {
      syncPageValidationState(attachmentPageKey, components);
    }
  }, [attachmentPageKey, attachmentPanel, components, syncPageValidationState, usesUploadPage]);

  const handleNext = () => {
    const valid = validatePage(attachmentPageKey, components);
    if (!valid) {
      return;
    }
    goToSummary();
  };

  return usesUploadPage && attachmentPanel ? (
    <AttachmentUploadPage
      attachmentPanel={attachmentPanel}
      onPrevious={() => goToPanel(panels[panels.length - 1]?.key)}
      onNext={goToSummary}
    />
  ) : (
    <>
      <RenderInputForm pageKey={attachmentPageKey} pageComponents={components} components={components} />
      <FormErrorSummary
        pageKey={attachmentPageKey}
        components={components}
        onNavigateToField={(error, id) => {
          if (error.pageKey !== attachmentPageKey) {
            goToError(error.pageKey, id);
          }
        }}
      />
      <FormSecondaryButtons />
      <FormButtonRow
        previousButton={
          <FormPrevButton
            label={translate(TEXTS.grensesnitt.navigation.previous)}
            onClick={() => goToPanel(panels[panels.length - 1]?.key)}
            role={navigationRole}
          />
        }
        nextButton={<FormNextButton label={translate(nextLabel)} onClick={handleNext} role={navigationRole} />}
      />
    </>
  );
};

export default AttachmentStep;
