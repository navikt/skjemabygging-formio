import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentType } from 'react';
import { getResolvedSubmissionPath } from '../context/form-definition/formDefinitionUtils';
import InputAlert from './components/alert/InputAlert';
import InputCheckbox from './components/checkbox/InputCheckbox';
import InputContainer from './components/container/InputContainer';
import InputDataGrid from './components/data-grid/InputDataGrid';
import InputFormGroup from './components/form-group/InputFormGroup';
import InputHtmlElement from './components/html-element/InputHtmlElement';
import InputRadio from './components/radio/InputRadio';
import InputRow from './components/row/InputRow';
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
const resolveNumberFormatKey = (component: Component) => (component.inputType === 'numeric' ? 'number' : 'decimal');
const resolveInputType = (component: Component) => {
  if (component.inputType === 'email' || component.inputType === 'url' || component.inputType === 'tel') {
    return component.inputType;
  }
};

const TextFieldEntry = ({ component, submissionPath, pageKey, pageComponents }: InputComponentProps) => (
  <InputTextField
    pageKey={pageKey}
    pageComponents={pageComponents}
    submissionPath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    required={isRequired(component)}
    autoComplete={component.autocomplete}
    inputMode={component.inputType}
    type={resolveInputType(component)}
    spellCheck={component.spellCheck}
  />
);

const NumberEntry = ({ component, submissionPath, pageKey, pageComponents }: InputComponentProps) => (
  <InputTextField
    pageKey={pageKey}
    pageComponents={pageComponents}
    submissionPath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    required={isRequired(component)}
    autoComplete={component.autocomplete}
    inputMode={component.inputType}
    spellCheck={component.spellCheck}
    formatKey={resolveNumberFormatKey(component)}
  />
);

const YearEntry = ({ component, submissionPath, pageKey, pageComponents }: InputComponentProps) => (
  <InputTextField
    pageKey={pageKey}
    pageComponents={pageComponents}
    submissionPath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    required={isRequired(component)}
    autoComplete={component.autocomplete}
    inputMode={component.inputType}
    spellCheck={component.spellCheck}
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

const HtmlElementEntry = ({ component }: InputComponentProps) => <InputHtmlElement component={component} />;

const AlertEntry = ({ component }: InputComponentProps) => <InputAlert component={component} />;

const ContainerEntry = ({ component, pageKey, pageComponents, componentRegistry }: InputComponentProps) => (
  <InputContainer
    component={component}
    pageKey={pageKey}
    pageComponents={pageComponents}
    componentRegistry={componentRegistry}
  />
);

const DataGridEntry = ({ component, pageKey, pageComponents, componentRegistry }: InputComponentProps) => (
  <InputDataGrid
    component={component}
    pageKey={pageKey}
    pageComponents={pageComponents}
    componentRegistry={componentRegistry}
  />
);

const FormGroupEntry = ({ component, pageKey, pageComponents, componentRegistry }: InputComponentProps) => (
  <InputFormGroup
    component={component}
    pageKey={pageKey}
    pageComponents={pageComponents}
    componentRegistry={componentRegistry}
  />
);

const RowEntry = ({ component, pageKey, pageComponents, componentRegistry }: InputComponentProps) => (
  <InputRow
    component={component}
    pageKey={pageKey}
    pageComponents={pageComponents}
    componentRegistry={componentRegistry}
  />
);

const inputComponentRegistry: InputComponentRegistry = {
  alertstripe: AlertEntry,
  container: ContainerEntry,
  datagrid: DataGridEntry,
  htmlelement: HtmlElementEntry,
  navSkjemagruppe: FormGroupEntry,
  fieldset: FormGroupEntry,
  row: RowEntry,
  number: NumberEntry,
  textfield: TextFieldEntry,
  textarea: TextAreaEntry,
  formioTextArea: TextAreaEntry,
  select: SelectEntry,
  navSelect: SelectEntry,
  landvelger: SelectEntry,
  valutavelger: SelectEntry,
  radiopanel: RadioEntry,
  navCheckbox: CheckboxEntry,
  selectboxes: CheckboxEntry,
  email: TextFieldEntry,
  firstName: TextFieldEntry,
  surname: TextFieldEntry,
  currency: NumberEntry,
  year: YearEntry,
};

export { inputComponentRegistry };
export type { InputComponentProps, InputComponentRegistry };
