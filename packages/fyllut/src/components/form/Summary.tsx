import { Alert, Box, Heading } from '@navikt/ds-react';
import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { navFormUtils, Panel, submissionTypesUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import {
  FormButtonRow,
  FormErrorSummary,
  FormNextButton,
  FormPrevButton,
  RenderSummaryForm,
  useFormDefinition,
  useFormPersistence,
  useSubmissionState,
  useValidation,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useAttachmentUpload } from './attachment-upload/AttachmentUploadContext';
import FormSecondaryButtons from './FormSecondaryButtons';
import { PREPARE_LETTER_KEY, PREPARE_NO_SUBMISSION_KEY } from './wizard/constants';

const toInputId = (submissionPath: string) => `input-${submissionPath.replace(/[.[\]]/g, '-')}`;
const DELETED_DRAFT_STORAGE_KEY = 'fyllut:new-render:deleted-draft-id';
const DELETED_DRAFT_QUERY_PARAM = 'deletedDraft';

interface Props {
  onBack: () => void;
  onNavigateToError: (pageKey: string, id: string) => void;
  onNavigateToStep: (stepKey: string) => void;
}

const Summary = ({ onBack, onNavigateToError, onNavigateToStep }: Props) => {
  const appConfig = useAppConfig();
  const { translate, currentLanguage } = useLanguages();
  const { form, activeComponents, panels } = useFormDefinition();
  const { submission } = useSubmissionState();
  const { pagesWithErrors, validatePages, getErrorsForPages, shouldShowSummaryForSummaryPage } = useValidation();
  const { submit, status, canSubmit } = useFormPersistence();
  const { handleDownloadFile } = useAttachmentUpload();
  const { search } = useLocation();
  const [attemptedSubmitWithErrors, setAttemptedSubmitWithErrors] = useState(false);
  const attachmentPanel = navFormUtils.getActiveAttachmentPanelFromForm(form, submission);
  const isNoSubmissionFlow =
    (!appConfig.submissionMethod || appConfig.submissionMethod === 'papernocoverpage') &&
    submissionTypesUtils.isPaperNoCoverPageSubmission(form.properties.submissionTypes);
  const summaryComponents =
    appConfig.submissionMethod === 'paper' || isNoSubmissionFlow
      ? [...activeComponents, ...(attachmentPanel ? [attachmentPanel] : [])]
      : activeComponents;
  const validationPages = [
    ...panels.map((panel: Panel) => ({ pageKey: panel.key, components: panel.components ?? [] })),
    ...(attachmentPanel ? [{ pageKey: attachmentPanel.key, components: attachmentPanel.components ?? [] }] : []),
  ];
  const summaryErrors = getErrorsForPages(validationPages);
  const hasSubmissionData = Object.keys(submission?.data ?? {}).length > 0;
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
  const shouldShowEmptyDigitalSummaryErrors =
    (appConfig.submissionMethod === 'digital' || appConfig.submissionMethod === 'digitalnologin') &&
    !hasSubmissionData &&
    summaryErrors.length > 0;
  const hasSummaryValidationErrors =
    isDeletedDraftSummary ||
    (summaryErrors.length > 0 &&
      (attemptedSubmitWithErrors ||
        shouldShowSummaryForSummaryPage() ||
        shouldShowEmptyDigitalSummaryErrors ||
        pagesWithErrors.size > 0 ||
        (appConfig.submissionMethod !== 'digital' && appConfig.submissionMethod !== 'digitalnologin')));
  const firstSummaryError = summaryErrors[0];

  const handleSubmit = () => {
    const failedPageKeys = validatePages(validationPages);
    if (failedPageKeys.length > 0) {
      setAttemptedSubmitWithErrors(true);
      return;
    }
    setAttemptedSubmitWithErrors(false);

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

  const handleContinueFilling = () => {
    if (!firstSummaryError) {
      return;
    }

    onNavigateToError(firstSummaryError.pageKey, toInputId(firstSummaryError.submissionPath));
  };

  return (
    <>
      {hasSummaryValidationErrors && (
        <>
          <Alert variant="warning">
            {attemptedSubmitWithErrors && <p>{translate(TEXTS.grensesnitt.navigation.summaryPageError)}</p>}
            <Heading spacing size="small" level="3">
              {translate(TEXTS.statiske.summaryPage.validationTitle)}
            </Heading>
            <p>{translate(TEXTS.statiske.summaryPage.validationMessage)}</p>
          </Alert>
          <Box marginBlock="space-0 space-24">
            <FormNextButton
              label={translate(TEXTS.grensesnitt.summaryPage.editAnswers)}
              onClick={handleContinueFilling}
            />
          </Box>
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
        appConfig={appConfig}
        handleDownloadFile={handleDownloadFile}
      />
      <FormErrorSummary
        pages={validationPages}
        onNavigateToField={(error, id) => {
          onNavigateToError(error.pageKey, id);
        }}
      />
      <FormSecondaryButtons />
      <FormButtonRow
        previousButton={
          hasSummaryValidationErrors ? (
            <FormNextButton
              label={translate(TEXTS.grensesnitt.summaryPage.editAnswers)}
              onClick={handleContinueFilling}
            />
          ) : (
            <FormPrevButton label={translate(TEXTS.grensesnitt.navigation.previous)} onClick={onBack} />
          )
        }
        nextButton={
          <FormNextButton
            label={translate(
              appConfig.submissionMethod === 'paper' || isNoSubmissionFlow
                ? TEXTS.grensesnitt.navigation.instructions
                : TEXTS.grensesnitt.navigation.sendToNav,
            )}
            onClick={handleSubmit}
            loading={status === 'submitting'}
          />
        }
      />
    </>
  );
};

export default Summary;
