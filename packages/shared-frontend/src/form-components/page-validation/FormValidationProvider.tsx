import { Form, Panel, Submission, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useCallback, useRef } from 'react';
import {
  useFormDefinitionForm,
  useFormDefinitionSubmissionMethod,
} from '../../context/form-definition/FormDefinitionContext';
import { getActivePanels, toComponentDefinitions } from '../../context/form-definition/formDefinitionUtils';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionActions } from '../../context/state/SubmissionStateContext';
import { ValidationProvider } from '../../context/validation/ValidationContext';
import { ValidationField } from '../../context/validation/validationTypes';
import { collectPageValidationFields } from './collectPageValidationFields';

type SpecialPageFieldsResolver = (pageKey: string, submission?: Submission) => ValidationField[] | undefined;

interface Props {
  children: ReactNode;
  initialPagesWithErrors?: string[];
  resolveSpecialPageFields?: SpecialPageFieldsResolver;
}

interface PageFieldsCache {
  submission?: Submission;
  submissionMethod?: SubmissionMethod;
  currentLanguage: string;
  form: Form;
  panels?: Panel[];
  fieldsByPage: Map<string, ValidationField[]>;
  resolveSpecialPageFields?: SpecialPageFieldsResolver;
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
const FormValidationProvider = ({ children, initialPagesWithErrors, resolveSpecialPageFields }: Props) => {
  const form = useFormDefinitionForm();
  const { getLatestSubmission } = useSubmissionActions();
  const submissionMethod = useFormDefinitionSubmissionMethod();
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
        cache?.form === form &&
        cache?.resolveSpecialPageFields === resolveSpecialPageFields;
      const currentCache: PageFieldsCache = isCacheValid
        ? cache
        : {
            submission,
            submissionMethod,
            currentLanguage,
            form,
            resolveSpecialPageFields,
            fieldsByPage: new Map<string, ValidationField[]>(),
          };
      cacheRef.current = currentCache;
      const { fieldsByPage } = currentCache;

      const cachedFields = fieldsByPage.get(pageKey);
      if (cachedFields) {
        return cachedFields;
      }

      let fields = resolveSpecialPageFields?.(pageKey, submission);
      if (fields === undefined) {
        currentCache.panels ??= getActivePanels(form, submission, { submissionMethod });
        const panel = currentCache.panels.find((currentPanel) => currentPanel.key === pageKey);
        fields = panel
          ? collectPageValidationFields({
              components: toComponentDefinitions(panel.components ?? []),
              form,
              submission,
              submissionMethod,
              currentLanguage,
            })
          : [];
      }

      fieldsByPage.set(pageKey, fields);
      return fields;
    },
    [currentLanguage, form, getLatestSubmission, submissionMethod, resolveSpecialPageFields],
  );

  return (
    <ValidationProvider initialPagesWithErrors={initialPagesWithErrors} resolvePageFields={resolvePageFields}>
      {children}
    </ValidationProvider>
  );
};

export default FormValidationProvider;
