import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactComponentType } from './index';

/**
 * Get id for custom component renderReact()
 */
export const getId = (component?: Component) => {
  return `${component?.id}-${component?.key}`;
};

export const getLabel = (component?: Component) => {
  return component?.label ?? '';
};

export const getHideLabel = (component?: Component) => {
  return component?.hideLabel ?? false;
};

/**
 * Get whether custom component is required renderReact()
 */
export const isRequired = (component?: Component) => {
  return component?.validate?.required;
};

export const isReadOnly = (component?: Component, options?: ReactComponentType['options']) => {
  return component?.readOnly || options?.readOnly;
};

const baseComponentUtils = {
  getId,
  getLabel,
  getHideLabel,
  isRequired,
  isReadOnly,
};
export default baseComponentUtils;
