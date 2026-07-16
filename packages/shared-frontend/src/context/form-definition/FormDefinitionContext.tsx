import {
  Component,
  Form,
  navFormUtils,
  numberUtils,
  Panel,
  submissionUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext, useEffect, useLayoutEffect, useMemo } from 'react';
import { evaluateFormioCalculatedValue } from '../../utils/formioEvaluation';
import { useLanguage } from '../language/LanguageContext';
import { createUpdatedSubmission, useSubmissionState } from '../state/SubmissionStateContext';
import {
  enrichFormWithBaseSubmissionPath,
  flattenComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
} from './formDefinitionUtils';
import { applyPrefilledValuesToSubmission } from './prefillSubmission';

const isNumericComponent = (component: Component) =>
  component.type === 'number' || component.type === 'currency' || component.type === 'year';

const toEvaluationNumber = (component: Component, value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }

  const normalizedValue =
    component.inputType === 'numeric' || component.type === 'year'
      ? value.replace(/\s/g, '')
      : value.replace(/\s/g, '').replace(',', '.');

  if (normalizedValue === '') {
    return value;
  }

  const isValidNumber =
    component.inputType === 'numeric' || component.type === 'year'
      ? numberUtils.isValidInteger(normalizedValue)
      : numberUtils.isValidDecimal(normalizedValue);

  return isValidNumber ? Number(normalizedValue) : value;
};

interface FormDefinitionContextType {
  form: Form;
  activeComponents: Component[];
  panels: Panel[];
}

interface Props {
  children: ReactNode;
  form: Form;
}

const FormDefinitionContext = createContext<FormDefinitionContextType>({} as FormDefinitionContextType);

const FormDefinitionProvider = ({ children, form }: Props) => {
  const { currentLanguage } = useLanguage();
  const { submission, setSubmission, clearSubmissionPaths } = useSubmissionState();
  const formWithBaseSubmissionPath = useMemo(() => enrichFormWithBaseSubmissionPath(form), [form]);

  const activeComponents = useMemo(
    () => navFormUtils.getActiveComponentsFromForm(formWithBaseSubmissionPath, submission),
    [formWithBaseSubmissionPath, submission],
  );

  const panels = useMemo(
    () => activeComponents.filter((component): component is Panel => component.type === 'panel'),
    [activeComponents],
  );

  const activeAttachmentPanel = useMemo(
    () => navFormUtils.getActiveAttachmentPanelFromForm(formWithBaseSubmissionPath, submission),
    [formWithBaseSubmissionPath, submission],
  );

  const calculatedComponents = useMemo(
    () =>
      flattenComponentsWithBaseSubmissionPath(formWithBaseSubmissionPath.components).filter(
        (component) => component.input && !!component.calculateValue && component.type !== 'maalgruppe',
      ),
    [formWithBaseSubmissionPath.components],
  );

  const numericComponents = useMemo(
    () =>
      flattenComponentsWithBaseSubmissionPath(formWithBaseSubmissionPath.components).filter(
        (component) => component.input && isNumericComponent(component),
      ),
    [formWithBaseSubmissionPath.components],
  );

  useLayoutEffect(() => {
    setSubmission((prev) => applyPrefilledValuesToSubmission(formWithBaseSubmissionPath, prev, currentLanguage));
  }, [currentLanguage, formWithBaseSubmissionPath, setSubmission]);

  useEffect(() => {
    if (calculatedComponents.length === 0) {
      return;
    }

    setSubmission((prev) => {
      const initialSubmission = prev ?? { data: {} };
      let nextSubmission = initialSubmission;

      calculatedComponents.forEach((component) => {
        const submissionPath = getResolvedSubmissionPath(component);
        const evaluationSubmission = numericComponents.reduce((acc, numericComponent) => {
          const numericSubmissionPath = getResolvedSubmissionPath(numericComponent);
          const rawValue = submissionUtils.getSubmissionValue(numericSubmissionPath, acc);
          const evaluationValue = toEvaluationNumber(numericComponent, rawValue);

          return rawValue === evaluationValue
            ? acc
            : createUpdatedSubmission(acc, numericSubmissionPath, evaluationValue);
        }, nextSubmission);
        const calculatedValue = evaluateFormioCalculatedValue({
          component,
          submission: evaluationSubmission,
          submissionPath,
        });
        const normalizedCalculatedValue = calculatedValue === '' ? undefined : calculatedValue;
        const currentValue = submissionUtils.getSubmissionValue(submissionPath, nextSubmission);

        if (currentValue !== normalizedCalculatedValue) {
          nextSubmission = createUpdatedSubmission(nextSubmission, submissionPath, normalizedCalculatedValue);
        }
      });

      return nextSubmission === initialSubmission ? prev : nextSubmission;
    });
  }, [calculatedComponents, numericComponents, setSubmission, submission]);

  useEffect(() => {
    const activeSubmissionPaths = new Set(
      flattenComponentsWithBaseSubmissionPath([
        ...activeComponents,
        ...(activeAttachmentPanel ? [activeAttachmentPanel] : []),
      ])
        .filter((component) => component.input)
        .map((component) => getResolvedSubmissionPath(component)),
    );
    const hiddenPathsToClear = flattenComponentsWithBaseSubmissionPath(formWithBaseSubmissionPath.components)
      .filter((component) => component.input && component.clearOnHide !== false)
      .map((component) => getResolvedSubmissionPath(component))
      .filter((submissionPath) => !activeSubmissionPaths.has(submissionPath));
    if (hiddenPathsToClear.length > 0) {
      clearSubmissionPaths(hiddenPathsToClear);
    }
  }, [activeAttachmentPanel, activeComponents, clearSubmissionPaths, formWithBaseSubmissionPath.components]);

  const value = useMemo(
    () => ({ form: formWithBaseSubmissionPath, activeComponents, panels }),
    [formWithBaseSubmissionPath, activeComponents, panels],
  );

  return <FormDefinitionContext.Provider value={value}>{children}</FormDefinitionContext.Provider>;
};

const useFormDefinition = () => useContext(FormDefinitionContext);

export { FormDefinitionProvider, useFormDefinition };
export type { FormDefinitionContextType };
