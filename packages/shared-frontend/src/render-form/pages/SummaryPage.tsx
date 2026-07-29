import { Alert, Box, ErrorSummary, Heading } from '@navikt/ds-react';
import { TEXTS, navFormUtils, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import FormErrorSummary from '../../components/error-summary/FormErrorSummary';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useFormPersistence } from '../../context/persistence/PersistenceContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import RenderSummaryForm from '../../form-components/RenderSummaryForm';
import { FormButtonRow, FormNextButton, FormPrevButton } from '../../layout/FormButtonRow';
import { useAttachmentUpload } from '../attachments/AttachmentUploadContext';
import type { SharedFormRendererProps } from '../types';
import SecondaryActions from '../wizard/SecondaryActions';
import useRendererNavigation from '../wizard/useRendererNavigation';
import { inputId, useSummaryValidation } from './useSummaryValidation';

const SummaryPage = ({ host }: { host: SharedFormRendererProps['host'] }) => {
  const { form, activeComponents, panels } = useFormDefinition();
  const { submission } = useSubmissionState();
  const { translate, currentLanguage } = useLanguage();
  const appConfig = useAppConfig();
  const { submit, status, canSubmit } = useFormPersistence();
  const { handleDownloadFile } = useAttachmentUpload();
  const [attemptedSubmitWithErrors, setAttemptedSubmitWithErrors] = useState(false);
  const navigate = useRendererNavigation(host);
  const {
    fallbackErrors,
    hasSubmissionData,
    pagesWithErrors,
    shouldShowSummaryForSummaryPage,
    summaryErrors,
    validatePages,
    validationPages,
  } = useSummaryValidation();
  const attachmentPanel = navFormUtils.getActiveAttachmentPanelFromForm(form, submission);
  const isNoSubmissionFlow =
    (!appConfig.submissionMethod || appConfig.submissionMethod === 'papernocoverpage') &&
    submissionTypesUtils.isPaperNoCoverPageSubmission(form.properties.submissionTypes);
  const summaryComponents =
    appConfig.submissionMethod === 'paper' || isNoSubmissionFlow
      ? [...activeComponents, ...(attachmentPanel ? [attachmentPanel] : [])]
      : activeComponents;
  const effectiveErrors = summaryErrors.length ? summaryErrors : fallbackErrors;
  const shouldShowEmptyDigitalErrors =
    (appConfig.submissionMethod === 'digital' || appConfig.submissionMethod === 'digitalnologin') &&
    !hasSubmissionData &&
    effectiveErrors.length > 0;
  const hasErrors =
    host.isDeletedDraftSummary ||
    (effectiveErrors.length > 0 &&
      (attemptedSubmitWithErrors ||
        shouldShowSummaryForSummaryPage() ||
        shouldShowEmptyDigitalErrors ||
        pagesWithErrors.size > 0 ||
        (appConfig.submissionMethod !== 'digital' && appConfig.submissionMethod !== 'digitalnologin')));
  const firstError = effectiveErrors[0];

  const submitForm = () => {
    const failedPages = validatePages(validationPages);
    if (failedPages.length || fallbackErrors.length) {
      setAttemptedSubmitWithErrors(true);
      return;
    }
    setAttemptedSubmitWithErrors(false);
    if (isNoSubmissionFlow) {
      navigate({ kind: 'prepare-submission', type: 'application' });
    } else if (
      appConfig.submissionMethod === 'paper' ||
      submissionTypesUtils.isPaperSubmissionOnly(form.properties.submissionTypes)
    ) {
      navigate({ kind: 'prepare-submission', type: 'cover-page-and-application' });
    } else if (canSubmit) {
      void submit();
    }
  };

  const continueFilling = () => {
    if (firstError) {
      navigate({ kind: 'panel', panelKey: firstError.pageKey }, { focusId: inputId(firstError.submissionPath) });
    }
  };

  return (
    <>
      {hasErrors && (
        <>
          <Alert variant="warning">
            {attemptedSubmitWithErrors && <p>{translate(TEXTS.grensesnitt.navigation.summaryPageError)}</p>}
            <Heading spacing size="small" level="3">
              {translate(TEXTS.statiske.summaryPage.validationTitle)}
            </Heading>
            <p>{translate(TEXTS.statiske.summaryPage.validationMessage)}</p>
          </Alert>
          <Box marginBlock="space-0 space-24">
            <FormNextButton label={translate(TEXTS.grensesnitt.summaryPage.editAnswers)} onClick={continueFilling} />
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
        onNavigateToField={(error, id) =>
          navigate({ kind: 'panel', panelKey: error.pageKey, focusId: id }, { focusId: id })
        }
      />
      {!summaryErrors.length && attemptedSubmitWithErrors && fallbackErrors.length > 0 && (
        <ErrorSummary heading={translate(TEXTS.validering.error)} data-cy="error-summary">
          {fallbackErrors.map((error) => (
            <ErrorSummary.Item
              key={error.submissionPath}
              href={`#${inputId(error.submissionPath)}`}
              onClick={(event) => {
                event.preventDefault();
                const focusId = inputId(error.submissionPath);
                navigate({ kind: 'panel', panelKey: error.pageKey, focusId }, { focusId });
              }}
            >
              {error.message}
            </ErrorSummary.Item>
          ))}
        </ErrorSummary>
      )}
      <SecondaryActions host={host} />
      <FormButtonRow
        previousButton={
          hasErrors ? (
            <FormNextButton label={translate(TEXTS.grensesnitt.summaryPage.editAnswers)} onClick={continueFilling} />
          ) : (
            <FormPrevButton
              label={translate(TEXTS.grensesnitt.navigation.previous)}
              onClick={() =>
                navigate(
                  navFormUtils.hasAttachment(form)
                    ? { kind: 'attachments' }
                    : { kind: 'panel', panelKey: panels[panels.length - 1]?.key ?? '' },
                )
              }
            />
          )
        }
        nextButton={
          <FormNextButton
            label={translate(
              appConfig.submissionMethod === 'paper' || isNoSubmissionFlow
                ? TEXTS.grensesnitt.navigation.instructions
                : TEXTS.grensesnitt.navigation.sendToNav,
            )}
            loading={status === 'submitting'}
            onClick={submitForm}
          />
        }
      />
    </>
  );
};

export default SummaryPage;
