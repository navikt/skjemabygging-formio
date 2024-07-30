import { Component, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import FormioUtils from 'formiojs/utils';
import BaseComponent from '../../base/BaseComponent';

/**
 * Get component matching beforeDateInputKey and if parentPath
 * also check if it matches exact parent element including brackets (for data grid)
 *
 * FormioUtils.getComponentPath(component) is without brackets, so it have same format as component.beforeDateInputKey
 * component.path includes brackets for exact element
 *
 * @param components
 * @param beforeDateInputKey
 * @param parentPath
 */
const getBeforeDateInputPath = (components: Component[], beforeDateInputKey: string, parentPath?: string) => {
  const beforeDateComponents = navFormUtils
    .flattenComponents(components)
    .filter(
      (component) =>
        FormioUtils.getComponentPath(component) === beforeDateInputKey &&
        (!parentPath || component.path?.startsWith(parentPath)),
    )
    .map((component) => component.path);

  return beforeDateComponents[0];
};

/**
 * Get value of beforeDateInputKey from submission
 *
 * @param instance
 */
const getBeforeDateInputValue = (instance: BaseComponent) => {
  let beforeDateInputPath = instance.component?.beforeDateInputKey;

  if (beforeDateInputPath && /\./.test(beforeDateInputPath) && instance.component?.key) {
    const parentPath = instance.path?.slice(0, (instance.component?.key.length + 1) * -1);
    beforeDateInputPath = getBeforeDateInputPath(instance.root.getComponents(), beforeDateInputPath, parentPath);
  }

  return FormioUtils.getValue(instance.root.submission, beforeDateInputPath);
};

/**
 * If components are inside datagrid this will return all matching components in the datagrid, ignoring brackets.
 *
 * @param instance
 */
const getComponentsWithDateInputKey = (instance: BaseComponent): Component[] => {
  const beforeDateInputKey = FormioUtils.getComponentPath(instance);
  return navFormUtils
    .flattenComponents(instance.root.getComponents() as Component[])
    .filter((component) => component.component?.beforeDateInputKey === beforeDateInputKey);
};

export { getBeforeDateInputValue, getComponentsWithDateInputKey };
