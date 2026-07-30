import { Alert, Box, ErrorSummary, Heading } from '@navikt/ds-react';
import {
  navFormUtils,
  Panel,
  submissionTypesUtils,
  submissionUtils,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { useFyllutAppConfig } from '../context/fyllut/FyllutAppConfigContext';
import { useFyllutLanguage } from '../context/fyllut/FyllutLanguageContext';
import { deriveValidations } from '../validation/deriveValidations';
import { validateValue } from '../validation/validators';
import { useAttachmentUpload } from './attachment-upload/AttachmentUploadContext';
import FormSecondaryButtons from './FormSecondaryButtons';
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
} from './framework';
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
  const appConfig = useFyllutAppConfig();
  const { translate, currentLanguage } = useFyllutLanguage();
  const { form, activeComponents } = useFormDefinition();
  const { submission } = useSubmissionState();
  const { pagesWithErrors, validatePages, getErrorsForPages, shouldShowSummaryForSummaryPage } = useValidation();
  const { submit, status, canSubmit } = useFormPersistence();
  const { handleDownloadFile } = useAttachmentUpload();
  const { search } = useLocation();
  const [attemptedSubmitWithErrors, setAttemptedSubmitWithErrors] = useState(false);
  const attachmentPanel = navFormUtils.getActiveAttachmentPanelFromForm(form, submission);
  const activePanels = navFormUtils.getActivePanelsFromForm(form, submission);
  const isNoSubmissionFlow =
    (!appConfig.submissionMethod || appConfig.submissionMethod === 'papernocoverpage') &&
    submissionTypesUtils.isPaperNoCoverPageSubmission(form.properties.submissionTypes);
  const summaryComponents =
    appConfig.submissionMethod === 'paper' || isNoSubmissionFlow
      ? [...activeComponents, ...(attachmentPanel ? [attachmentPanel] : [])]
      : activeComponents;
  const validationPages = [
    ...activePanels.map((panel: Panel) => ({ pageKey: panel.key, components: panel.components ?? [] })),
    ...(attachmentPanel ? [{ pageKey: attachmentPanel.key, components: attachmentPanel.components ?? [] }] : []),
  ];
  const summaryErrors = getErrorsForPages(validationPages);
  const hasSubmissionData = Object.keys(submission?.data ?? {}).length > 0;
  const fallbackSummaryErrors = useMemo(() => {
    if (hasSubmissionData) {
      return [];
    }

    return validationPages.flatMap(({ pageKey, components }) =>
      deriveValidations(components, undefined, appConfig.submissionMethod).flatMap(
        ({ submissionPath, field, rules }) => {
          const violation = validateValue(
            submissionUtils.getSubmissionValue(submissionPath, undefined),
            field,
            rules,
            currentLanguage,
            {
              submission: undefined,
              submissionPath,
            },
          );

          return violation
            ? [{ pageKey, submissionPath, message: translate(violation.textKey, violation.params) }]
            : [];
        },
      ),
    );
  }, [appConfig.submissionMethod, currentLanguage, hasSubmissionData, translate, validationPages]);
  const effectiveSummaryErrors = summaryErrors.length > 0 ? summaryErrors : fallbackSummaryErrors;
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
    effectiveSummaryErrors.length > 0;
  const navigationRole = form.path === 'newrender' ? 'button' : 'link';
  const primaryActionLabel =
    form.path === 'newrender'
      ? 'Send inn'
      : appConfig.submissionMethod === 'paper' || isNoSubmissionFlow
        ? TEXTS.grensesnitt.navigation.instructions
        : TEXTS.grensesnitt.navigation.sendToNav;
  const hasSummaryValidationErrors =
    isDeletedDraftSummary ||
    (effectiveSummaryErrors.length > 0 &&
      (attemptedSubmitWithErrors ||
        shouldShowSummaryForSummaryPage() ||
        shouldShowEmptyDigitalSummaryErrors ||
        pagesWithErrors.size > 0 ||
        (appConfig.submissionMethod !== 'digital' && appConfig.submissionMethod !== 'digitalnologin')));
  const firstSummaryError = effectiveSummaryErrors[0];

  const handleSubmit = () => {
    const failedPageKeys = validatePages(validationPages);
    if (failedPageKeys.length > 0) {
      setAttemptedSubmitWithErrors(true);
      return;
    }
    if (fallbackSummaryErrors.length > 0) {
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
              role={navigationRole}
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
      {summaryErrors.length === 0 && attemptedSubmitWithErrors && fallbackSummaryErrors.length > 0 && (
        <ErrorSummary heading={translate(TEXTS.validering.error)} data-cy="error-summary">
          {fallbackSummaryErrors.map((error) => {
            const id = toInputId(error.submissionPath);
            return (
              <ErrorSummary.Item
                key={error.submissionPath}
                href={`#${id}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onNavigateToError(error.pageKey, id);
                }}
              >
                {error.message}
              </ErrorSummary.Item>
            );
          })}
        </ErrorSummary>
      )}
      <FormSecondaryButtons />
      <FormButtonRow
        previousButton={
          hasSummaryValidationErrors ? (
            <FormNextButton
              label={translate(TEXTS.grensesnitt.summaryPage.editAnswers)}
              onClick={handleContinueFilling}
              role={navigationRole}
            />
          ) : (
            <FormPrevButton
              label={translate(TEXTS.grensesnitt.navigation.previous)}
              onClick={onBack}
              role={navigationRole}
            />
          )
        }
        nextButton={
          <FormNextButton
            label={translate(primaryActionLabel)}
            onClick={handleSubmit}
            loading={status === 'submitting'}
            role={navigationRole}
          />
        }
      />
    </>
  );
};

export default Summary;
