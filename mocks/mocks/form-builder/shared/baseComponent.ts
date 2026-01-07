import conditionalComponent, { ConditionalComponentType } from './conditionalComponent';
import { generateId, sanitizeAndLowerCase } from './utils';
import validateComponent, { ValidateComponentType } from './validateComponent';

export interface BaseComponentType {
  id?: string;
  navId?: string;
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
    id,
    navId,
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
    id: id ?? generateId(),
    navId: navId ?? generateId(),
    key: createdKey,
    label,
    description: description ?? '',
    additionalDescriptionLabel: additionalDescriptionLabel ?? '',
    additionalDescriptionText: additionalDescriptionText ?? '',
    validate: validateComponent(validate),
    customConditional: customConditional ?? '',
    conditional: conditionalComponent(conditional),
  };
};

export default baseComponent;
