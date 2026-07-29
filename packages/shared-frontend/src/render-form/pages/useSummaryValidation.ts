import { navFormUtils, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useValidation } from '../../context/validation/ValidationContext';
import { deriveValidations } from '../../validation/deriveValidations';
import { validateValue } from '../../validation/validators';

const inputId = (submissionPath: string) => `input-${submissionPath.replace(/[.[\]]/g, '-')}`;

const useSummaryValidation = () => {
  const { form } = useFormDefinition();
  const { submission } = useSubmissionState();
  const { translate, currentLanguage } = useLanguage();
  const appConfig = useAppConfig();
  const { pagesWithErrors, validatePages, getErrorsForPages, shouldShowSummaryForSummaryPage } = useValidation();
  const activePanels = navFormUtils.getActivePanelsFromForm(form, submission);
  const attachmentPanel = navFormUtils.getActiveAttachmentPanelFromForm(form, submission);
  const validationPages = useMemo(
    () => [
      ...activePanels.map((panel) => ({ pageKey: panel.key, components: panel.components ?? [] })),
      ...(attachmentPanel ? [{ pageKey: attachmentPanel.key, components: attachmentPanel.components ?? [] }] : []),
    ],
    [activePanels, attachmentPanel],
  );
  const summaryErrors = getErrorsForPages(validationPages);
  const hasSubmissionData = Object.keys(submission?.data ?? {}).length > 0;
  const fallbackErrors = useMemo(
    () =>
      hasSubmissionData
        ? []
        : validationPages.flatMap(({ pageKey, components }) =>
            deriveValidations(components, undefined, appConfig.submissionMethod).flatMap(
              ({ submissionPath, field, rules }) => {
                const violation = validateValue(
                  submissionUtils.getSubmissionValue(submissionPath, undefined),
                  field,
                  rules,
                  currentLanguage,
                  { submission: undefined, submissionPath },
                );
                return violation
                  ? [{ pageKey, submissionPath, message: translate(violation.textKey, violation.params) }]
                  : [];
              },
            ),
          ),
    [appConfig.submissionMethod, currentLanguage, hasSubmissionData, translate, validationPages],
  );

  return {
    fallbackErrors,
    hasSubmissionData,
    pagesWithErrors,
    shouldShowSummaryForSummaryPage,
    summaryErrors,
    validatePages,
    validationPages,
  };
};

export { inputId, useSummaryValidation };
