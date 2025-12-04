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

const getParentPanel = (component: ReactComponentType) => {
  if (!component.parent) {
    return;
  }

  return component.parent?.component?.type === 'panel' ? component.parent : getParentPanel(component.parent);
};

const isOnCurrentPage = (component: ReactComponentType) => {
  return component.root.currentPage?.id === getParentPanel(component)?.id;
};

const setupBuilderErrors = (thisComponent: any) => {
  if (thisComponent.builderMode && thisComponent.component) {
    if (
      thisComponent.component.customConditional?.includes('row.') &&
      thisComponent.parent?.type &&
      thisComponent.parent?.type !== 'datagrid' &&
      thisComponent.parent?.type !== 'container'
    ) {
      thisComponent.component.builderErrors = ['Mulig feil på avansert betinget visning'];
    } else {
      thisComponent.component.builderErrors = [];
    }
  }
};

const baseComponentUtils = {
  getId,
  getLabel,
  getHideLabel,
  getEditFields,
  isRequired,
  isReadOnly,
  isOnCurrentPage,
  setupBuilderErrors,
};
export default baseComponentUtils;
