import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentDefinition } from './component-types';
import { getValues } from './inputComponentUtils';

const isComponentValue = (value: unknown): value is ComponentValue =>
  typeof value === 'object' &&
  value !== null &&
  'value' in value &&
  typeof value.value === 'string' &&
  'label' in value &&
  typeof value.label === 'string';

const isSelectedValuesMap = (value: unknown): value is Record<string, boolean> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((selected) => typeof selected === 'boolean');

const resolveConfiguredOptionDefault = (component: ComponentDefinition): ComponentValue | undefined => {
  const defaultValue =
    typeof component.defaultValue === 'string'
      ? component.defaultValue
      : isComponentValue(component.defaultValue)
        ? component.defaultValue.value
        : undefined;

  return defaultValue ? getValues(component).find(({ value }) => value === defaultValue) : undefined;
};

const resolveDefaultSubmissionValue = (component: ComponentDefinition): unknown => {
  switch (component.type) {
    case 'number':
    case 'currency':
      return component.defaultValue === 0 || component.defaultValue ? component.defaultValue : undefined;
    case 'navCheckbox':
      return typeof component.defaultValue === 'boolean' ? component.defaultValue : undefined;
    case 'radiopanel':
      return typeof component.defaultValue === 'string' && component.defaultValue ? component.defaultValue : undefined;
    case 'select':
    case 'navSelect':
      return resolveConfiguredOptionDefault(component);
    case 'landvelger':
    case 'valutavelger':
      return isComponentValue(component.defaultValue) ? component.defaultValue : undefined;
    case 'selectboxes':
      return isSelectedValuesMap(component.defaultValue) ? component.defaultValue : undefined;
    case 'attachment':
      if (typeof component.defaultValue === 'string' && component.defaultValue) {
        return { key: component.defaultValue };
      }
      if (
        typeof component.defaultValue === 'object' &&
        component.defaultValue !== null &&
        'key' in component.defaultValue &&
        typeof component.defaultValue.key === 'string'
      ) {
        return component.defaultValue;
      }
      return undefined;
    default:
      return undefined;
  }
};

export { resolveDefaultSubmissionValue };
