import { Form, navFormUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useFyllutAppConfig } from '../../context/fyllut/FyllutAppConfigContext';
import { useFyllutLanguage } from '../../context/fyllut/FyllutLanguageContext';
import AttachmentUploadPage from '../attachment-upload/AttachmentUploadPage';
import {
  CancelAndDeleteButton,
  FormButtonRow,
  FormErrorSummary,
  FormNextButton,
  FormPrevButton,
  RenderInputForm,
  SaveButton,
  useFormDefinition,
  useFormPersistence,
  useSubmissionState,
  useValidation,
} from '../framework';
import { ATTACHMENTS_KEY } from './constants';
import { useWizardNavigation } from './useWizardNavigation';

const AttachmentStep = ({ form: _form }: { form: Form }) => {
  const { translate } = useFyllutLanguage();
  const { submissionMethod } = useFyllutAppConfig();
  const { form: formDefinition, panels } = useFormDefinition();
  const { submission } = useSubmissionState();
  const { canSaveDraft } = useFormPersistence();
  const { syncPageValidationState, validatePage } = useValidation();
  const { goToPanel, goToSummary, goToError } = useWizardNavigation('attachment');
  const attachmentPanel = navFormUtils.getActiveAttachmentPanelFromForm(formDefinition, submission);
  const components = useMemo(() => attachmentPanel?.components ?? [], [attachmentPanel]);
  const attachmentPageKey = attachmentPanel?.key ?? ATTACHMENTS_KEY;
  const nextLabel =
    submissionMethod === 'digital' ? TEXTS.grensesnitt.navigation.saveAndContinue : TEXTS.grensesnitt.navigation.next;
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
      <FormButtonRow
        cancelButton={<CancelAndDeleteButton />}
        previousButton={
          <FormPrevButton
            label={translate(TEXTS.grensesnitt.navigation.previous)}
            onClick={() => goToPanel(panels[panels.length - 1]?.key)}
          />
        }
        nextButton={<FormNextButton label={translate(nextLabel)} onClick={handleNext} />}
        saveButton={canSaveDraft && <SaveButton />}
      />
    </>
  );
};

export default AttachmentStep;
