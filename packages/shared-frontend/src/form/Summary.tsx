import { Alert } from '@navikt/ds-react';
import {
  navFormUtils,
  Panel,
  PanelValidation,
  submissionTypesUtils,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { useFyllutAppConfig } from '../context/fyllut/FyllutAppConfigContext';
import { useFyllutLanguage } from '../context/fyllut/FyllutLanguageContext';
import { useAttachmentUpload } from './attachment-upload/AttachmentUploadContext';
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

const DELETED_DRAFT_STORAGE_KEY = 'fyllut:new-render:deleted-draft-id';
const DELETED_DRAFT_QUERY_PARAM = 'deletedDraft';
const DISCARDED_SUBMISSION_STORAGE_KEY = 'fyllut:new-render:discarded-submission';

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
  const { form, activeComponents } = useFormDefinition();
  const { submission, setSubmission } = useSubmissionState();
  const { getErrorsForPages, validatePages } = useValidation();
  const { submit, status, error, canSubmit, canSaveDraft } = useFormPersistence();
  const { handleDownloadFile } = useAttachmentUpload();
  const { search } = useLocation();
  const [hasDiscardedSubmission] = useState(() => sessionStorage.getItem(DISCARDED_SUBMISSION_STORAGE_KEY) === '1');
  const attachmentPanel = navFormUtils.getActiveAttachmentPanelFromForm(form, submission);
  const activePanels = navFormUtils.getActivePanelsFromForm(form, submission);
  const isNoSubmissionFlow =
    (!appConfig.submissionMethod || appConfig.submissionMethod === 'papernocoverpage') &&
    submissionTypesUtils.isPaperNoCoverPageSubmission(form.properties.submissionTypes);
  const summaryComponents =
    appConfig.submissionMethod === 'paper' || isNoSubmissionFlow
      ? [...activeComponents, ...(attachmentPanel ? [attachmentPanel] : [])]
      : activeComponents;
  const validationPages = useMemo(
    () => [
      ...activePanels.map((panel: Panel) => ({ pageKey: panel.key, components: panel.components ?? [] })),
      ...(attachmentPanel ? [{ pageKey: attachmentPanel.key, components: attachmentPanel.components ?? [] }] : []),
    ],
    [activePanels, attachmentPanel],
  );
  const validationPageKeys = validationPages.map(({ pageKey }) => pageKey).join(',');
  const validatedSummaryRef = useRef<{ pageKeys: string; submission: typeof submission }>();
  const validationErrors = getErrorsForPages(validationPages);
  const panelValidationList = useMemo<PanelValidation[]>(
    () =>
      validationPages.map(({ pageKey }) => ({
        key: pageKey,
        hasValidationErrors: validationErrors.some((validationError) => validationError.pageKey === pageKey),
      })),
    [validationErrors, validationPages],
  );
  const hasValidationErrors = validationErrors.length > 0;
  const deletedDraftId = sessionStorage.getItem(DELETED_DRAFT_STORAGE_KEY);
  const currentDraftId = new URLSearchParams(search).get('innsendingsId');
  const isDeletedDraftSummary =
    new URLSearchParams(search).get(DELETED_DRAFT_QUERY_PARAM) === '1' ||
    (!!deletedDraftId && deletedDraftId === currentDraftId);
  useEffect(() => {
    if (isDeletedDraftSummary) {
      sessionStorage.removeItem(DELETED_DRAFT_STORAGE_KEY);
    }
  }, [isDeletedDraftSummary]);
  useEffect(() => {
    if (hasDiscardedSubmission) {
      sessionStorage.removeItem(DISCARDED_SUBMISSION_STORAGE_KEY);
      setSubmission(undefined);
    }
  }, [hasDiscardedSubmission, setSubmission]);
  useEffect(() => {
    if (
      validatedSummaryRef.current?.pageKeys === validationPageKeys &&
      validatedSummaryRef.current.submission === submission
    ) {
      return;
    }

    validatedSummaryRef.current = { pageKeys: validationPageKeys, submission };
    validatePages(validationPages);
  }, [submission, validatePages, validationPageKeys, validationPages]);
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
    if (hasValidationErrors) {
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

  if (status === 'submitted') {
    return <div>{translate(TEXTS.statiske.error.alreadySubmitted)}</div>;
  }

  return (
    <>
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
      {(isDeletedDraftSummary || hasDiscardedSubmission) && (
        <Alert variant="warning">{translate(TEXTS.grensesnitt.navigation.summaryPageError)}</Alert>
      )}
      {submitErrorMessage && <Alert variant="error">{translate(submitErrorMessage)}</Alert>}
      <FormButtonRow
        cancelButton={<CancelAndDeleteButton />}
        previousButton={<FormPrevButton label={translate(TEXTS.grensesnitt.navigation.previous)} onClick={onBack} />}
        nextButton={
          <FormNextButton
            label={translate(primaryActionLabel)}
            onClick={handleSubmit}
            disabled={hasValidationErrors}
            loading={status === 'submitting'}
          />
        }
        saveButton={canSaveDraft && <SaveButton />}
      />
    </>
  );
};

export default Summary;
