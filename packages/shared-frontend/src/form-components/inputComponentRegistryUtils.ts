import {
  Component,
  FieldSize,
  FormComponentType,
  formatUtils,
  numberUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentType } from 'react';
import { ReadMoreProps } from '../components/read-more/ReadMore';
import { SelectType } from '../components/select/selectUtils';
import { getResolvedSubmissionPath } from '../context/form-definition/formDefinitionUtils';
import { toSubmissionFormat } from '../formatting/inputFormat';
import { ComponentDefinitionByType } from './component-types';

/**
 * Component `type` literals handled by the input registry. This is every
 * `FormComponentType` except the ones the new render never mounts as an input:
 * `formioTextArea` and `password` (legacy Formio-only) and `panel` (handled by
 * page/navigation, not the input registry).
 */
type InputComponentType = Exclude<FormComponentType, 'formioTextArea' | 'password' | 'panel'>;

/**
 * Props for an input adapter. Parameterized by the adapter's component
 * definition: a migrated adapter declares e.g. `InputComponentProps<TextFieldDefinition>`
 * and receives the exact type.
 */
interface InputComponentProps<T extends Component = Component> {
  component: T;
  submissionPath?: string;
  componentRegistry?: InputComponentRegistry;
}

/**
 * Registry mapping each supported component `type` to its input adapter. The
 * mapped type ties every key to an adapter expecting that type's definition
 * (`ComponentDefinitionByType<K>`), so an adapter cannot be registered under the
 * wrong key, and a missing key is a compile error (exhaustiveness).
 */
type InputComponentRegistry = {
  [K in InputComponentType]: ComponentType<InputComponentProps<ComponentDefinitionByType<K>>>;
};

const getValues = (component: Component) => component.values ?? component.data?.values ?? [];

const isRequired = (component: Component) => component.validate?.required ?? false;

const legacyFieldSizeMap: Record<string, FieldSize> = {
  'input--xxs': 'xxsmall',
  'input--xs': 'xsmall',
  'input--s': 'small',
  'input--m': 'medium',
  'input--l': 'large',
  'input--xl': 'xlarge',
  'input--xxl': 'xxlarge',
};

const resolveFieldSize = (component: Component): FieldSize | undefined =>
  component.fieldSize ? legacyFieldSizeMap[component.fieldSize] : undefined;

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
  resolveFieldSize,
  resolveInputType,
  resolveNumberDisplayValue,
  resolveNumberFormatKey,
  resolveNumericStateValue,
  resolveReadMore,
  resolveSelectType,
  resolveSubmissionPath,
  resolveTextFormatKey,
};
export type { InputComponentProps, InputComponentRegistry, InputComponentType };
