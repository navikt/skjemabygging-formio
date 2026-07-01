import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentType } from 'react';
import InputCheckbox from './components/checkbox/InputCheckbox';
import InputRadio from './components/radio/InputRadio';
import InputSelect from './components/select/InputSelect';
import InputTextArea from './components/text-area/InputTextArea';
import InputTextField from './components/text-field/InputTextField';

interface InputComponentProps {
  component: Component;
}

type InputComponentRegistry = Record<string, ComponentType<InputComponentProps>>;

const getValues = (component: Component) => component.values ?? component.data?.values ?? [];
const isRequired = (component: Component) => component.validate?.required ?? false;

const TextFieldEntry = ({ component }: InputComponentProps) => (
  <InputTextField
    submissionPath={component.key}
    label={component.label}
    description={component.description}
    required={isRequired(component)}
    autoComplete={component.autocomplete}
  />
);

const TextAreaEntry = ({ component }: InputComponentProps) => (
  <InputTextArea
    submissionPath={component.key}
    label={component.label}
    description={component.description}
    required={isRequired(component)}
    maxLength={component.validate?.maxLength}
  />
);

const SelectEntry = ({ component }: InputComponentProps) => (
  <InputSelect
    submissionPath={component.key}
    label={component.label}
    description={component.description}
    values={getValues(component)}
    required={isRequired(component)}
  />
);

const RadioEntry = ({ component }: InputComponentProps) => (
  <InputRadio
    submissionPath={component.key}
    legend={component.label}
    description={component.description}
    values={getValues(component)}
    required={isRequired(component)}
  />
);

const CheckboxEntry = ({ component }: InputComponentProps) => (
  <InputCheckbox
    submissionPath={component.key}
    legend={component.label}
    description={component.description}
    values={getValues(component)}
    required={isRequired(component)}
  />
);

const inputComponentRegistry: InputComponentRegistry = {
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
