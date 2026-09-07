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
import { FieldValidationProp } from '../components/types';
import { getResolvedSubmissionPath } from '../context/form-definition/formDefinitionUtils';
import { toSubmissionFormat } from '../formatting/inputFormat';
import { PatternRule } from '../validation/validators';
import { ComponentDefinitionByType } from './component-types';

/**
 * Component `type` literals handled by the input registry. This is every
 * `FormComponentType` except `panel`, which is handled by page/navigation
 * rather than the input registry.
 */
type InputComponentType = Exclude<FormComponentType, 'panel'>;

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

/**
 * The authored regular expression, with the message the author wrote for it. The two legacy
 * properties are normalized here so nothing below the form definition has to know about them.
 */
const resolvePattern = (component: Component): PatternRule | undefined =>
  component.validate?.pattern
    ? {
        expression: component.validate.pattern,
        message: component.validate.customMessage ?? component.validate.patternMessage,
      }
    : undefined;

/**
 * The generic constraints authored on a component. Everything that follows from the component type
 * itself (a valid email, a valid account number, ...) is owned by the rendered component, so this
 * only maps what the form author declared. `validate.custom` is not evaluated at all.
 */
const resolveValidation = (component: Component): FieldValidationProp => ({
  minLength: typeof component.validate?.minLength === 'number' ? component.validate.minLength : undefined,
  maxLength: typeof component.validate?.maxLength === 'number' ? component.validate.maxLength : undefined,
  min: typeof component.validate?.min === 'number' ? component.validate.min : undefined,
  max: typeof component.validate?.max === 'number' ? component.validate.max : undefined,
  minYear: typeof component.validate?.minYear === 'number' ? component.validate.minYear : undefined,
  maxYear: typeof component.validate?.maxYear === 'number' ? component.validate.maxYear : undefined,
  digitsOnly: component.validate?.digitsOnly,
  pattern: resolvePattern(component),
});

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

export {
  getValues,
  isRequired,
  resolveFieldSize,
  resolveNumberDisplayValue,
  resolveNumberFormatKey,
  resolveNumericStateValue,
  resolvePattern,
  resolveReadMore,
  resolveSelectType,
  resolveSubmissionPath,
  resolveTextFormatKey,
  resolveValidation,
};
export type { InputComponentProps, InputComponentRegistry, InputComponentType };
