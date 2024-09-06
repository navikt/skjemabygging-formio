import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactComponentType } from './index';

/**
 * Get id for custom component renderReact()
 */
export const getId = (component?: Component) => {
  return `${component?.id}-${component?.key}`;
};

const getKey = (component: Component) => {
  return component.key;
};

const getClassName = (component?: Component) => {
  // TODO: Remove nav-new and nav- prefix for fieldsize when all components are Aksel
  return component?.fieldSize ? `nav-${component?.fieldSize} nav-new` : 'nav-new';
};

export const getLabel = (component?: Component) => {
  return component?.label ?? '';
};

export const getLegend = (component?: Component) => {
  return component?.legend ?? '';
};

export const getHideLabel = (component?: Component) => {
  return component?.hideLabel ?? false;
};

const getAutoComplete = (component?: Component) => {
  return component?.autocomplete ?? 'off';
};

const getSpellCheck = (component?: Component) => {
  return component?.spellCheck;
};

export const isRequired = (component?: Component) => {
  return component?.validate?.required;
};

export const isReadOnly = (component?: Component, options?: ReactComponentType['options']) => {
  return component?.readOnly || options?.readOnly;
};

export const isProtected = (component?: Component) => {
  return !!component?.protected;
};

const baseComponentUtils = {
  getId,
  getKey,
  getClassName,
  getLabel,
  getHideLabel,
  getAutoComplete,
  getSpellCheck,
  isRequired,
  isReadOnly,
  isProtected,
};
export default baseComponentUtils;
