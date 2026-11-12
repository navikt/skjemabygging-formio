import { ComponentDefinition } from '../../component-types';
import { getValues } from '../../inputComponentUtils';

// The old renderer stored a `select` answer as the option value only, for example "norge".
// TODO: Remove when every form uses the new renderer and the drafts saved before the switch are deleted.
// Drafts are deleted after the form's mellomlagringDurationDays, 28 days by default.
const normalizeLegacySelectValue = (component: ComponentDefinition, value: unknown): unknown => {
  if (component.type !== 'select' || typeof value !== 'string' || !value) {
    return value;
  }

  return getValues(component).find((option) => option.value === value) ?? value;
};

export { normalizeLegacySelectValue };
