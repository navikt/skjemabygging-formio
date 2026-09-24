import { attachmentUtils, ComponentValue, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentDefinition } from './component-types';
import { normalizeAttachmentValue } from './components/attachment/attachmentValue';
import { getValues } from './inputComponentUtils';

type ConfiguredOptionComponent = Extract<ComponentDefinition, { type: 'select' | 'navSelect' }>;

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

const resolveConfiguredOptionDefault = (component: ConfiguredOptionComponent): ComponentValue | undefined => {
  const defaultValue =
    typeof component.defaultValue === 'string'
      ? component.defaultValue
      : isComponentValue(component.defaultValue)
        ? component.defaultValue.value
        : undefined;

  return defaultValue ? getValues(component).find(({ value }) => value === defaultValue) : undefined;
};

const resolveDefaultSubmissionValue = (
  component: ComponentDefinition,
  statePath = component.key,
  submissionMethod?: SubmissionMethod,
): unknown => {
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
      return normalizeAttachmentValue(
        component,
        statePath,
        component.defaultValue ||
          attachmentUtils.getImplicitValueKey(component.attachmentValues ?? component.values, submissionMethod),
      );
    default:
      return undefined;
  }
};

export { resolveDefaultSubmissionValue };
