import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const flattenedComponentTypes = new Set(['accordion', 'columns', 'fieldset', 'form-group', 'navSkjemagruppe', 'row']);

const skippedComponentTypes = new Set(['alertstripe', 'content', 'hidden', 'htmlelement', 'image']);

const getNestedComponents = (component: Component): Component[] => {
  if (component.components?.length) {
    return component.components;
  }

  if (component.component) {
    return [component.component];
  }

  return [];
};

const hasConditionalLogic = (component: Component) =>
  Boolean(component.conditional?.when || component.conditional?.json || component.customConditional);

const shouldSkipComponent = (component: Component) =>
  skippedComponentTypes.has(component.type) || (!component.key && getNestedComponents(component).length === 0);

const isAttachmentPanel = (component: Component) => component.type === 'panel' && component.isAttachmentPanel === true;

const shouldFlattenComponent = (component: Component) =>
  !isAttachmentPanel(component) &&
  getNestedComponents(component).length > 0 &&
  (!component.key ||
    component.input === false ||
    flattenedComponentTypes.has(component.type) ||
    component.type === 'panel');

const createsObjectScope = (component: Component) => component.type === 'container' && Boolean(component.key);

const createsArrayScope = (component: Component) => component.type === 'datagrid' && Boolean(component.key);

export {
  createsArrayScope,
  createsObjectScope,
  getNestedComponents,
  hasConditionalLogic,
  isAttachmentPanel,
  shouldFlattenComponent,
  shouldSkipComponent,
};
