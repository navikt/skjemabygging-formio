import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentType } from 'react';
import { ReadMoreProps } from '../components/read-more/ReadMore';
import { SelectType } from '../components/select/selectUtils';
import { getResolvedSubmissionPath } from '../context/form-definition/formDefinitionUtils';

interface InputComponentProps {
  component: Component;
  submissionPath?: string;
  componentRegistry?: InputComponentRegistry;
}

type InputComponentRegistry = Record<string, ComponentType<InputComponentProps>>;

const getValues = (component: Component) => component.values ?? component.data?.values ?? [];

const isRequired = (component: Component) => component.validate?.required ?? false;

const resolveSubmissionPath = (component: Component, submissionPath?: string) =>
  submissionPath ?? getResolvedSubmissionPath(component);

const resolveNumberFormatKey = (component: Component) => (component.inputType === 'numeric' ? 'number' : 'decimal');

const resolveTextFormatKey = (component: Component) => {
  if (component.type === 'orgNr') {
    return 'organizationNumber';
  }
};

const resolveReadMore = (component: Component): ReadMoreProps | undefined => {
  if (!component.additionalDescriptionLabel || !component.additionalDescriptionText) {
    return undefined;
  }

  return {
    label: component.additionalDescriptionLabel,
    text: component.additionalDescriptionText,
  };
};

const resolveSelectType = (component: Component): SelectType => {
  if (component.selectType) {
    return component.selectType;
  }

  if (component.type === 'select') {
    return 'select';
  }

  if (component.type === 'navSelect') {
    return 'combobox';
  }

  return 'auto';
};

const resolveInputType = (component: Component) => {
  if (component.inputType === 'email' || component.inputType === 'url' || component.inputType === 'tel') {
    return component.inputType;
  }
};

export {
  getValues,
  isRequired,
  resolveInputType,
  resolveNumberFormatKey,
  resolveReadMore,
  resolveSelectType,
  resolveSubmissionPath,
  resolveTextFormatKey,
};
export type { InputComponentProps, InputComponentRegistry };
