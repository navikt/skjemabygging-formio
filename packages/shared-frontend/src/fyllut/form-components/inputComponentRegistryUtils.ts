import { Component, formatUtils, numberUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentType } from 'react';
import { ReadMoreProps } from '../../components/read-more/ReadMore';
import { SelectType } from '../../components/select/selectUtils';
import { getResolvedSubmissionPath } from '../../context/form-definition/formDefinitionUtils';
import { toSubmissionFormat } from '../../formatting/inputFormat';

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

const resolveNumberDisplayValue = (component: Component, value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  if (component.readOnly && component.calculateValue) {
    return numberUtils.toLocaleString(typeof value === 'number' || typeof value === 'string' ? value : String(value), {
      maximumFractionDigits: 2,
    });
  }

  return formatUtils.formatNumber(String(value), component.inputType === 'numeric');
};

const resolveNumericStateValue = (component: Component, value: string) => {
  const formatted = toSubmissionFormat(value, resolveNumberFormatKey(component));
  const normalizedValue =
    component.inputType === 'numeric' ? formatted.replace(/\s/g, '') : formatted.replace(/\s/g, '').replace(',', '.');

  if (normalizedValue === '') {
    return undefined;
  }

  const isValidNumber =
    component.inputType === 'numeric'
      ? numberUtils.isValidInteger(normalizedValue)
      : numberUtils.isValidDecimal(normalizedValue);

  return isValidNumber ? Number(normalizedValue) : formatted;
};

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
  resolveNumberDisplayValue,
  resolveNumberFormatKey,
  resolveNumericStateValue,
  resolveReadMore,
  resolveSelectType,
  resolveSubmissionPath,
  resolveTextFormatKey,
};
export type { InputComponentProps, InputComponentRegistry };
