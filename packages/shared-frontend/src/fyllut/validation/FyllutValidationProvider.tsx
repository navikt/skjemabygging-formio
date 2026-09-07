import { Form, navFormUtils, Panel, Submission, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useCallback, useRef } from 'react';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { toComponentDefinitions } from '../../context/form-definition/formDefinitionUtils';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useSubmissionMethod } from '../../context/submission-method/SubmissionMethodContext';
import { ValidationProvider } from '../../context/validation/ValidationContext';
import { ValidationField } from '../../context/validation/validationTypes';
import { collectPageValidationFields } from '../../form-components/page-validation/collectPageValidationFields';
import { fyllutValidationFieldsRegistry } from '../attachments/attachmentValidationFields';

interface Props {
  children: ReactNode;
  initialPagesWithErrors?: string[];
}

interface PageFieldsCache {
  submission?: Submission;
  submissionMethod?: SubmissionMethod;
  currentLanguage: string;
  form: Form;
  fieldsByPage: Map<string, ValidationField[]>;
}

/**
 * Gives validation a way to rebuild any page from the current submission.
 *
 * Registrations alone cannot answer for a page the user never opened, and they go stale when a
 * later page changes a condition that shows or hides a field on an earlier one. The resolver below
 * derives the active panel and its fields from the latest submission every time it is asked, so
 * `validatePage`, `validatePages` and the summary page always see the form as it is right now.
 *
 * The submission is read through `getLatestSubmission()` rather than from render state, so
 * validating right after a change (clicking next straight after typing) sees the value the user
 * just entered.
 */
const FyllutValidationProvider = ({ children, initialPagesWithErrors }: Props) => {
  const { form } = useFormDefinition();
  const { getLatestSubmission } = useSubmissionState();
  const { submissionMethod } = useSubmissionMethod();
  const { currentLanguage } = useLanguage();
  const cacheRef = useRef<PageFieldsCache>();

  const resolvePageFields = useCallback(
    (pageKey: string): ValidationField[] => {
      const submission = getLatestSubmission();
      const cache = cacheRef.current;
      // The summary page asks for every page on each render, so the rebuild is memoized until
      // something it depends on changes.
      const isCacheValid =
        cache?.submission === submission &&
        cache?.submissionMethod === submissionMethod &&
        cache?.currentLanguage === currentLanguage &&
        cache?.form === form;
      const fieldsByPage = isCacheValid ? cache.fieldsByPage : new Map<string, ValidationField[]>();
      cacheRef.current = { submission, submissionMethod, currentLanguage, form, fieldsByPage };

      const cachedFields = fieldsByPage.get(pageKey);
      if (cachedFields) {
        return cachedFields;
      }

      const panels: Panel[] = navFormUtils.getAllActivePanelsFromForm(form, submission, { submissionMethod });
      const panel = panels.find((currentPanel) => currentPanel.key === pageKey);
      const fields = panel
        ? collectPageValidationFields({
            components: toComponentDefinitions(panel.components ?? []),
            form,
            submission,
            submissionMethod,
            currentLanguage,
            validationRegistry: fyllutValidationFieldsRegistry,
          })
        : [];

      fieldsByPage.set(pageKey, fields);
      return fields;
    },
    [currentLanguage, form, getLatestSubmission, submissionMethod],
  );

  return (
    <ValidationProvider initialPagesWithErrors={initialPagesWithErrors} resolvePageFields={resolvePageFields}>
      {children}
    </ValidationProvider>
  );
};

export default FyllutValidationProvider;
