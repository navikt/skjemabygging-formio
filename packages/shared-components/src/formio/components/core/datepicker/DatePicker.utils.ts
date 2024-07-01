import { Component, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import FormioUtils from 'formiojs/utils';

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

const getBeforeDateInputValue = (instance: any) => {
  let beforeDateInputPath = instance.component?.beforeDateInputKey;

  if (/\./.test(instance.component?.beforeDateInputKey) && instance.component?.key) {
    const parentPath = instance.path.slice(0, (instance.component?.key.length + 1) * -1);
    beforeDateInputPath = getBeforeDateInputPath(instance.root.getComponents(), beforeDateInputPath, parentPath);
  }

  return FormioUtils.getValue(instance.root.submission, beforeDateInputPath);
};

/**
 * If components are inside datagrid this will return all matching components in the datagrid.
 *
 * @param instance
 */
const getComponentsWithDateInputKey = (instance: any): Component[] => {
  const beforeDateInputKey = FormioUtils.getComponentPath(instance);
  return navFormUtils
    .flattenComponents(instance.root.getComponents() as Component[])
    .filter((component) => component.component?.beforeDateInputKey === beforeDateInputKey);
};

export { getBeforeDateInputValue, getComponentsWithDateInputKey };
