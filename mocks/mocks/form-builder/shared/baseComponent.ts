import conditionalComponent, { ConditionalComponentType } from './conditionalComponent';
import { generateId, sanitizeAndLowerCase } from './utils';
import validateComponent, { ValidateComponentType } from './validateComponent';

export interface BaseComponentType {
  label?: string;
  key?: string;
  description?: string;
  additionalDescriptionText?: string;
  additionalDescriptionLabel?: string;
  validate?: ValidateComponentType;
  customConditional?: string;
  conditional?: ConditionalComponentType;
}

const baseComponent = (props?: BaseComponentType) => {
  const {
    label,
    key,
    description,
    additionalDescriptionText,
    additionalDescriptionLabel,
    validate,
    customConditional,
    conditional,
  } = props ?? {};

  const createdKey = key ?? (label ? sanitizeAndLowerCase(label) : generateId());

  return {
    id: generateId(),
    navId: createdKey,
    key: createdKey,
    label,
    description: description ?? '',
    additionalDescriptionLabel: additionalDescriptionLabel ?? '',
    additionalDescriptionText: additionalDescriptionText ?? '',
    validate: validate ?? validateComponent(),
    customConditional: customConditional ?? '',
    conditional: conditional ?? conditionalComponent(),
  };
};

export default baseComponent;
