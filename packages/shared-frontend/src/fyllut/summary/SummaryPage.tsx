import { Heading } from '@navikt/ds-react';
import { PanelValidation, submissionTypesUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo, useState } from 'react';
import Alert from '../../components/alert/Alert';
import FormErrorSummary from '../../components/error-summary/FormErrorSummary';
import { useApplication } from '../../context/application/ApplicationContext';
import { useAttachmentPendingOperations, useAttachmentUpload } from '../../context/attachment/AttachmentUploadContext';
import {
  useFormDefinitionForm,
  useFormDefinitionPanels,
  useFormDefinitionSubmissionMethod,
} from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useValidationActions, useValidationErrorsForPages } from '../../context/validation/ValidationContext';
import RenderSummaryForm from '../../form-components/RenderSummaryForm';
import { inputId } from '../../utils/inputId';
import { useFormActions } from '../context/form-actions/FormActionsContext';
import { APPLICATION_DOWNLOAD_KEY, PAPER_SUBMISSION_KEY } from '../form-flow/constants';
import { useFormNavigation } from '../form-flow/useFormNavigation';
import FormActionError from '../layout/FormActionError';
import { FormButtonRow, FormNextButton, FormPrevButton } from '../layout/FormButtonRow';
import CancelAndDeleteButton from '../navigation/CancelAndDeleteButton';
import SaveButton from '../navigation/SaveButton';
import styles from './SummaryPage.module.css';

const SummaryPage = () => {
  const { logger, environment } = useApplication();
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const { translate, currentLanguage } = useLanguage();
  const form = useFormDefinitionForm();
  const panels = useFormDefinitionPanels();
  const { submission } = useSubmissionState();
  const { validatePages } = useValidationActions();
  const { submit, status, canSubmit, canSaveDraft } = useFormActions();
  const { handleDownloadFile, hasPendingOperations } = useAttachmentUpload();
  const hasPendingAttachments = useAttachmentPendingOperations();
  const [attemptedPendingSubmit, setAttemptedPendingSubmit] = useState(false);
  const { goToPanel, goToError } = useFormNavigation('summary');
  const isNoSubmissionFlow =
    (!submissionMethod || submissionMethod === 'papernocoverpage') &&
    submissionTypesUtils.isPaperNoCoverPageSubmission(form.properties.submissionTypes);
  const validationPageKeys = useMemo(() => panels.map((panel) => panel.key), [panels]);
  const validationErrors = useValidationErrorsForPages(validationPageKeys);
  const panelValidationList = useMemo<PanelValidation[]>(
    () =>
      validationPageKeys.map((pageKey) => ({
        key: pageKey,
        hasValidationErrors: validationErrors.some((validationError) => validationError.pageKey === pageKey),
      })),
    [validationErrors, validationPageKeys],
  );
  const primaryActionLabel =
    submissionMethod === 'paper' || isNoSubmissionFlow
      ? TEXTS.grensesnitt.navigation.instructions
      : TEXTS.grensesnitt.navigation.sendToNav;

  const handleSubmit = () => {
    const pending = hasPendingOperations();
    setAttemptedPendingSubmit(pending);
    if (pending) return;

    // Every page is validated from the current submission, so a page the user never opened reports
    // its missing answers here instead of silently passing.
    if (validatePages(validationPageKeys).length > 0) {
      return;
    }

    if (isNoSubmissionFlow) {
      goToPanel(APPLICATION_DOWNLOAD_KEY);
      return;
    }

    if (submissionMethod === 'paper' || submissionTypesUtils.isPaperSubmissionOnly(form.properties.submissionTypes)) {
      goToPanel(PAPER_SUBMISSION_KEY);
      return;
    }

    if (canSubmit) {
      void submit();
    }
  };

  const hasValidationErrors = validationErrors.length > 0;
  const isReadyToSubmit = !hasValidationErrors && !hasPendingAttachments;
  const navigateToFirstError = () => {
    const firstError = validationErrors[0];
    if (firstError) {
      goToError(firstError.pageKey, inputId(firstError.submissionPath));
    }
  };

  if (status === 'submitted') {
    return <div>{translate(TEXTS.statiske.error.alreadySubmitted)}</div>;
  }

  return (
    <>
      {hasValidationErrors && (
        <>
          <Alert variant="warning">
            <Heading spacing size="small" level="3">
              {translate(TEXTS.statiske.summaryPage.validationTitle)}
            </Heading>
            {translate(TEXTS.statiske.summaryPage.validationMessage)}
          </Alert>
          <div className={styles.continueEditing}>
            <FormPrevButton
              variant="primary"
              label={translate(TEXTS.grensesnitt.summaryPage.editAnswers)}
              onClick={navigateToFirstError}
            />
          </div>
        </>
      )}
      <div className={styles.cards}>
        <RenderSummaryForm
          activeComponents={panels}
          submission={submission}
          form={form}
          currentLanguage={currentLanguage}
          translate={translate}
          panelValidationList={panelValidationList}
          rendererConfig={{ submissionMethod, logger, environment }}
          handleDownloadFile={handleDownloadFile}
        />
      </div>
      <FormErrorSummary
        pageKeys={validationPageKeys}
        onNavigateToField={(error, id) => {
          goToError(error.pageKey, id);
        }}
      />
      <FormActionError />
      {hasPendingAttachments && attemptedPendingSubmit && (
        <Alert variant="error" marginBottom="space-16">
          {translate(TEXTS.statiske.attachment.pendingOperations)}
        </Alert>
      )}
      <FormButtonRow
        cancelButton={<CancelAndDeleteButton />}
        previousButton={
          <FormPrevButton
            variant={isReadyToSubmit ? 'secondary' : 'primary'}
            label={translate(
              hasValidationErrors ? TEXTS.grensesnitt.summaryPage.editAnswers : TEXTS.grensesnitt.navigation.previous,
            )}
            onClick={hasValidationErrors ? navigateToFirstError : () => goToPanel(panels[panels.length - 1]?.key)}
          />
        }
        nextButton={
          <FormNextButton
            variant={isReadyToSubmit ? 'primary' : 'secondary'}
            label={translate(primaryActionLabel)}
            onClick={handleSubmit}
            loading={status === 'submitting'}
          />
        }
        saveButton={canSaveDraft && <SaveButton showError={false} />}
      />
    </>
  );
};

export default SummaryPage;
