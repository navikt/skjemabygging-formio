import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentType } from 'react';
import { getResolvedSubmissionPath } from '../context/form-definition/formDefinitionUtils';
import InputCheckbox from './components/checkbox/InputCheckbox';
import InputContainer from './components/container/InputContainer';
import InputRadio from './components/radio/InputRadio';
import InputSelect from './components/select/InputSelect';
import InputTextArea from './components/text-area/InputTextArea';
import InputTextField from './components/text-field/InputTextField';

interface InputComponentProps {
  component: Component;
  submissionPath?: string;
  pageKey: string;
  pageComponents: Component[];
  componentRegistry?: InputComponentRegistry;
}

type InputComponentRegistry = Record<string, ComponentType<InputComponentProps>>;

const getValues = (component: Component) => component.values ?? component.data?.values ?? [];
const isRequired = (component: Component) => component.validate?.required ?? false;
const resolveSubmissionPath = (component: Component, submissionPath?: string) =>
  submissionPath ?? getResolvedSubmissionPath(component);

const TextFieldEntry = ({ component, submissionPath, pageKey, pageComponents }: InputComponentProps) => (
  <InputTextField
    pageKey={pageKey}
    pageComponents={pageComponents}
    submissionPath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    required={isRequired(component)}
    autoComplete={component.autocomplete}
  />
);

const TextAreaEntry = ({ component, submissionPath, pageKey, pageComponents }: InputComponentProps) => (
  <InputTextArea
    pageKey={pageKey}
    pageComponents={pageComponents}
    submissionPath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    required={isRequired(component)}
    maxLength={component.validate?.maxLength}
  />
);

const SelectEntry = ({ component, submissionPath, pageKey, pageComponents }: InputComponentProps) => (
  <InputSelect
    pageKey={pageKey}
    pageComponents={pageComponents}
    submissionPath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    values={getValues(component)}
    required={isRequired(component)}
  />
);

const RadioEntry = ({ component, submissionPath, pageKey, pageComponents }: InputComponentProps) => (
  <InputRadio
    pageKey={pageKey}
    pageComponents={pageComponents}
    submissionPath={resolveSubmissionPath(component, submissionPath)}
    legend={component.label}
    description={component.description}
    values={getValues(component)}
    required={isRequired(component)}
  />
);

const CheckboxEntry = ({ component, submissionPath, pageKey, pageComponents }: InputComponentProps) => (
  <InputCheckbox
    pageKey={pageKey}
    pageComponents={pageComponents}
    submissionPath={resolveSubmissionPath(component, submissionPath)}
    legend={component.label}
    description={component.description}
    values={getValues(component)}
    required={isRequired(component)}
  />
);

const ContainerEntry = ({ component, pageKey, pageComponents, componentRegistry }: InputComponentProps) => (
  <InputContainer
    component={component}
    pageKey={pageKey}
    pageComponents={pageComponents}
    componentRegistry={componentRegistry}
  />
);

const inputComponentRegistry: InputComponentRegistry = {
  container: ContainerEntry,
  textfield: TextFieldEntry,
  textarea: TextAreaEntry,
  formioTextArea: TextAreaEntry,
  select: SelectEntry,
  navSelect: SelectEntry,
  radiopanel: RadioEntry,
  navCheckbox: CheckboxEntry,
  selectboxes: CheckboxEntry,
};

export { inputComponentRegistry };
export type { InputComponentProps, InputComponentRegistry };
