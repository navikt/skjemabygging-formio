import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const flattenedComponentTypes = new Set([
  'accordion',
  'columns',
  'fieldset',
  'form-group',
  'navSkjemagruppe',
  'panel',
  'row',
]);

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

const shouldFlattenComponent = (component: Component) =>
  getNestedComponents(component).length > 0 &&
  (!component.key || component.input === false || flattenedComponentTypes.has(component.type));

const createsObjectScope = (component: Component) => component.type === 'container' && Boolean(component.key);

const createsArrayScope = (component: Component) => component.type === 'datagrid' && Boolean(component.key);

export {
  createsArrayScope,
  createsObjectScope,
  getNestedComponents,
  hasConditionalLogic,
  shouldFlattenComponent,
  shouldSkipComponent,
};
