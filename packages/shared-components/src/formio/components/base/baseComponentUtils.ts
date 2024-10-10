import { Component, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactComponentType } from './index';

/**
 * Get id for custom component renderReact()
 */
const getId = (component?: Component) => {
  return `${component?.id}-${component?.key}`;
};

const getLabel = (component?: Component) => {
  return component?.label ?? '';
};

const getHideLabel = (component?: Component) => {
  return component?.hideLabel ?? false;
};

const getEditFields = (editForm: Component) => {
  return navFormUtils
    .flattenComponents(editForm.components?.[0].components as Component[])
    .map((component) => component.key);
};

/**
 * Get whether custom component is required renderReact()
 */
const isRequired = (component?: Component) => {
  return component?.validate?.required;
};

const isReadOnly = (component?: Component, options?: ReactComponentType['options']) => {
  return (
    component?.readOnly || options?.readOnly || (component?.key === 'key' && options?.editComponent?.protectedApiKey)
  );
};

const baseComponentUtils = {
  getId,
  getLabel,
  getHideLabel,
  getEditFields,
  isRequired,
  isReadOnly,
};
export default baseComponentUtils;
