import { Component, Form, navFormUtils, Panel, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';
import { useSubmission } from '../submission/SubmissionContext';

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
  const { submission, clearSubmissionPaths } = useSubmission();

  const activeComponents = useMemo(
    () => navFormUtils.getActiveComponentsFromForm(form, submission),
    [form, submission],
  );

  const panels = useMemo(
    () => activeComponents.filter((component): component is Panel => component.type === 'panel'),
    [activeComponents],
  );

  useEffect(() => {
    const activeKeys = new Set(navFormUtils.flattenComponents(activeComponents).map((component) => component.key));
    const hiddenPathsToClear = navFormUtils
      .flattenComponents(form.components)
      .filter((component) => component.input && component.clearOnHide !== false && !activeKeys.has(component.key))
      .map((component) => component.key)
      .filter((key) => submissionUtils.getSubmissionValue(key, submission) !== undefined);
    if (hiddenPathsToClear.length > 0) {
      clearSubmissionPaths(hiddenPathsToClear);
    }
  }, [activeComponents, form.components, submission, clearSubmissionPaths]);

  const value = useMemo(() => ({ form, activeComponents, panels }), [form, activeComponents, panels]);

  return <FormDefinitionContext.Provider value={value}>{children}</FormDefinitionContext.Provider>;
};

const useFormDefinition = () => useContext(FormDefinitionContext);

export { FormDefinitionProvider, useFormDefinition };
export type { FormDefinitionContextType };
