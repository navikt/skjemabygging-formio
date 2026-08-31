import { Alert, Heading } from '@navikt/ds-react';
import { PanelValidation, submissionTypesUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import FormErrorSummary from '../../components/error-summary/FormErrorSummary';
import { useApplication } from '../../context/application/ApplicationContext';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useSubmissionMethod } from '../../context/submission-method/SubmissionMethodContext';
import { useValidation } from '../../context/validation/ValidationContext';
import RenderSummaryForm from '../../form-components/RenderSummaryForm';
import { inputId } from '../../utils/inputId';
import { useAttachmentUpload } from '../attachments/context/AttachmentUploadContext';
import { useFormActions } from '../context/form-actions/FormActionsContext';
import { APPLICATION_DOWNLOAD_KEY, PAPER_SUBMISSION_KEY } from '../form-flow/constants';
import FormActionError from '../layout/FormActionError';
import { FormButtonRow, FormNextButton, FormPrevButton } from '../layout/FormButtonRow';
import CancelAndDeleteButton from '../navigation/CancelAndDeleteButton';
import SaveButton from '../navigation/SaveButton';

interface Props {
  onBack: () => void;
  onNavigateToError: (pageKey: string, id: string) => void;
  onNavigateToStep: (stepKey: string) => void;
}

const Summary = ({ onBack, onNavigateToError, onNavigateToStep }: Props) => {
  const { logger, environment } = useApplication();
  const { submissionMethod } = useSubmissionMethod();
  const { translate, currentLanguage } = useLanguage();
  const { form, panels } = useFormDefinition();
  const { submission } = useSubmissionState();
  const { getErrorsForPages, validatePages } = useValidation();
  const { submit, status, canSubmit, canSaveDraft } = useFormActions();
  const { handleDownloadFile } = useAttachmentUpload();
  const isNoSubmissionFlow =
    (!submissionMethod || submissionMethod === 'papernocoverpage') &&
    submissionTypesUtils.isPaperNoCoverPageSubmission(form.properties.submissionTypes);
  const validationPages = useMemo(
    () => panels.map((panel) => ({ pageKey: panel.key, components: panel.components ?? [] })),
    [panels],
  );
  const validationErrors = getErrorsForPages(validationPages);
  const panelValidationList = useMemo<PanelValidation[]>(
    () =>
      validationPages.map(({ pageKey }) => ({
        key: pageKey,
        hasValidationErrors: validationErrors.some((validationError) => validationError.pageKey === pageKey),
      })),
    [validationErrors, validationPages],
  );
  const primaryActionLabel =
    submissionMethod === 'paper' || isNoSubmissionFlow
      ? TEXTS.grensesnitt.navigation.instructions
      : TEXTS.grensesnitt.navigation.sendToNav;

  const handleSubmit = () => {
    if (validatePages(validationPages).length > 0) {
      return;
    }

    if (isNoSubmissionFlow) {
      onNavigateToStep(APPLICATION_DOWNLOAD_KEY);
      return;
    }

    if (submissionMethod === 'paper' || submissionTypesUtils.isPaperSubmissionOnly(form.properties.submissionTypes)) {
      onNavigateToStep(PAPER_SUBMISSION_KEY);
      return;
    }

    if (canSubmit) {
      void submit();
    }
  };
  const hasValidationErrors = validationErrors.length > 0;
  const navigateToFirstError = () => {
    const firstError = validationErrors[0];
    if (firstError) {
      onNavigateToError(firstError.pageKey, inputId(firstError.submissionPath));
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
          <FormPrevButton label={translate(TEXTS.grensesnitt.summaryPage.editAnswers)} onClick={navigateToFirstError} />
        </>
      )}
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
      <FormErrorSummary
        pages={validationPages}
        onNavigateToField={(error, id) => {
          onNavigateToError(error.pageKey, id);
        }}
      />
      <FormActionError />
      <FormButtonRow
        cancelButton={<CancelAndDeleteButton />}
        previousButton={
          <FormPrevButton
            label={translate(
              hasValidationErrors ? TEXTS.grensesnitt.summaryPage.editAnswers : TEXTS.grensesnitt.navigation.previous,
            )}
            onClick={hasValidationErrors ? navigateToFirstError : onBack}
          />
        }
        nextButton={
          <FormNextButton
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

export default Summary;
