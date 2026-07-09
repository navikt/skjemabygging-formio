import { Component, Form, navFormUtils, Panel } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';
import { useSubmissionState } from '../state/SubmissionStateContext';
import {
  enrichFormWithBaseSubmissionPath,
  flattenComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
} from './formDefinitionUtils';

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
  const { submission, clearSubmissionPaths } = useSubmissionState();
  const formWithBaseSubmissionPath = useMemo(() => enrichFormWithBaseSubmissionPath(form), [form]);

  const activeComponents = useMemo(
    () => navFormUtils.getActiveComponentsFromForm(formWithBaseSubmissionPath, submission),
    [formWithBaseSubmissionPath, submission],
  );

  const panels = useMemo(
    () => activeComponents.filter((component): component is Panel => component.type === 'panel'),
    [activeComponents],
  );

  useEffect(() => {
    const activeSubmissionPaths = new Set(
      flattenComponentsWithBaseSubmissionPath(activeComponents)
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
  }, [activeComponents, clearSubmissionPaths, formWithBaseSubmissionPath.components]);

  const value = useMemo(
    () => ({ form: formWithBaseSubmissionPath, activeComponents, panels }),
    [formWithBaseSubmissionPath, activeComponents, panels],
  );

  return <FormDefinitionContext.Provider value={value}>{children}</FormDefinitionContext.Provider>;
};

const useFormDefinition = () => useContext(FormDefinitionContext);

export { FormDefinitionProvider, useFormDefinition };
export type { FormDefinitionContextType };
