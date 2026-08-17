import { Alert, Heading } from '@navikt/ds-react';
import { navFormUtils, PanelValidation, submissionTypesUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useAttachmentUpload } from '../context/attachment-upload/AttachmentUploadContext';
import { useFyllutAppConfig } from '../context/fyllut/FyllutAppConfigContext';
import { useFyllutLanguage } from '../context/fyllut/FyllutLanguageContext';
import { inputId } from '../utils/inputId';
import {
  CancelAndDeleteButton,
  FormButtonRow,
  FormErrorSummary,
  FormNextButton,
  FormPrevButton,
  RenderSummaryForm,
  SaveButton,
  useFormDefinition,
  useFormPersistence,
  useSubmissionState,
  useValidation,
} from './framework';
import { PREPARE_LETTER_KEY, PREPARE_NO_SUBMISSION_KEY } from './wizard/constants';

const hasUserMessage = (error: unknown): error is { userMessage: string } =>
  typeof error === 'object' && error !== null && 'userMessage' in error && typeof error.userMessage === 'string';

interface Props {
  onBack: () => void;
  onNavigateToError: (pageKey: string, id: string) => void;
  onNavigateToStep: (stepKey: string) => void;
}

const Summary = ({ onBack, onNavigateToError, onNavigateToStep }: Props) => {
  const appConfig = useFyllutAppConfig();
  const { translate, currentLanguage } = useFyllutLanguage();
  const { form, activeComponents, panels } = useFormDefinition();
  const { submission } = useSubmissionState();
  const { getErrorsForPages, validatePages } = useValidation();
  const { submit, status, error, canSubmit, canSaveDraft } = useFormPersistence();
  const { handleDownloadFile } = useAttachmentUpload();
  const attachmentPanel = panels.find(navFormUtils.isVedleggspanel);
  const isNoSubmissionFlow =
    (!appConfig.submissionMethod || appConfig.submissionMethod === 'papernocoverpage') &&
    submissionTypesUtils.isPaperNoCoverPageSubmission(form.properties.submissionTypes);
  const summaryComponents =
    appConfig.submissionMethod === 'paper' || isNoSubmissionFlow
      ? [...activeComponents, ...(attachmentPanel ? [attachmentPanel] : [])]
      : activeComponents;
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
    appConfig.submissionMethod === 'paper' || isNoSubmissionFlow
      ? TEXTS.grensesnitt.navigation.instructions
      : TEXTS.grensesnitt.navigation.sendToNav;
  const submitErrorMessage = hasUserMessage(error)
    ? error.userMessage
    : error
      ? TEXTS.statiske.error.serverErrorTitle
      : undefined;

  const handleSubmit = () => {
    if (validatePages(validationPages).length > 0) {
      return;
    }

    if (isNoSubmissionFlow) {
      onNavigateToStep(PREPARE_NO_SUBMISSION_KEY);
      return;
    }

    if (
      appConfig.submissionMethod === 'paper' ||
      submissionTypesUtils.isPaperSubmissionOnly(form.properties.submissionTypes)
    ) {
      onNavigateToStep(PREPARE_LETTER_KEY);
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
        activeComponents={summaryComponents}
        activeAttachmentUploadsPanel={
          appConfig.submissionMethod === 'digital' || appConfig.submissionMethod === 'digitalnologin'
            ? attachmentPanel
            : undefined
        }
        submission={submission}
        form={form}
        currentLanguage={currentLanguage}
        translate={translate}
        panelValidationList={panelValidationList}
        appConfig={appConfig}
        handleDownloadFile={handleDownloadFile}
      />
      <FormErrorSummary
        pages={validationPages}
        onNavigateToField={(error, id) => {
          onNavigateToError(error.pageKey, id);
        }}
      />
      {submitErrorMessage && <Alert variant="error">{translate(submitErrorMessage)}</Alert>}
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
