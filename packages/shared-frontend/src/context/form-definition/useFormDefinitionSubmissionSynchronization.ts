import { Form, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { ComponentDefinition } from '../../form-components/component-types';
import { useApplication } from '../application/ApplicationContext';
import { useLanguage } from '../language/LanguageContext';
import { useSubmissionState } from '../state/SubmissionStateContext';
import { applyCalculatedValues, CalculationTarget, isCalculatedComponent } from './calculatedValues';
import { collectDataGridRowScopes } from './dataGridRows';
import {
  flattenComponentsWithBaseSubmissionPath,
  getActivePanels,
  toComponentDefinitions,
} from './formDefinitionUtils';
import { applyInitialValuesToSubmission } from './initialSubmissionValues';

interface Props {
  activeComponents: ComponentDefinition[];
  form: Form;
  submissionMethod?: SubmissionMethod;
}

const useFormDefinitionSubmissionSynchronization = ({ activeComponents, form, submissionMethod }: Props) => {
  const { logger } = useApplication();
  const { currentLanguage } = useLanguage();
  const { submission, setSubmission } = useSubmissionState();
  const reportedCalculationCyclesRef = useRef(new Set<string>());
  const hasCalculatedComponents = useMemo(
    () => flattenComponentsWithBaseSubmissionPath(form.components).some(isCalculatedComponent),
    [form],
  );
  const dataGridRowScopes = useMemo(() => {
    if (!hasCalculatedComponents) {
      return [];
    }

    return collectDataGridRowScopes({
      components: activeComponents,
      submission,
      form,
      submissionMethod,
    });
  }, [activeComponents, form, hasCalculatedComponents, submission, submissionMethod]);
  const reportCalculationCycle = useCallback(
    (targets: CalculationTarget[]) => {
      const componentKeys = [...new Set(targets.map(({ component }) => component.key).filter(Boolean))].sort();
      const reportKey = `${form.path}\0${componentKeys.join('\0')}`;
      if (reportedCalculationCyclesRef.current.has(reportKey)) {
        return;
      }

      reportedCalculationCyclesRef.current.add(reportKey);
      logger?.error?.('Calculated values did not converge', {
        componentKeys,
        formPath: form.path,
      });
    },
    [form.path, logger],
  );

  useLayoutEffect(() => {
    setSubmission((previous) =>
      applyInitialValuesToSubmission(form, previous, currentLanguage, {
        prefillMode: 'missing',
        submissionMethod,
      }),
    );
  }, [currentLanguage, form, setSubmission, submission, submissionMethod]);

  useEffect(() => {
    if (!hasCalculatedComponents) {
      return;
    }

    setSubmission((previous) => {
      const usesRenderedSubmission = previous === submission;
      const latestActiveComponents = usesRenderedSubmission
        ? activeComponents
        : toComponentDefinitions(getActivePanels(form, previous, { submissionMethod }));
      const latestDataGridRowScopes = usesRenderedSubmission
        ? dataGridRowScopes
        : collectDataGridRowScopes({
            components: latestActiveComponents,
            submission: previous,
            form,
            submissionMethod,
          });

      return applyCalculatedValues({
        submission: previous,
        formComponents: latestActiveComponents,
        dataGridRowScopes: latestDataGridRowScopes,
        onNonConvergence: reportCalculationCycle,
      });
    });
  }, [
    activeComponents,
    dataGridRowScopes,
    form,
    hasCalculatedComponents,
    reportCalculationCycle,
    setSubmission,
    submission,
    submissionMethod,
  ]);
};

export { useFormDefinitionSubmissionSynchronization };
