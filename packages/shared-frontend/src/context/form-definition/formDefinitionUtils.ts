import { Component, Form, navFormUtils, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentDefinition } from './../../form-components/component-types';

/**
 * The single ingestion boundary between the legacy shared-domain `Component`
 * tree (`Form.components`, `navFormUtils` output) and the typed
 * `ComponentDefinition` tree the shared-frontend render path and tree-walkers
 * consume. Every `ComponentDefinition` is structurally a `Component`, so this is
 * a safe widening-in-reverse: the runtime `type` string is treated as the
 * discriminant. Do the conversion here rather than sprinkling casts.
 */
const toComponentDefinitions = (components: Component[] = []): ComponentDefinition[] =>
  components as ComponentDefinition[];

const getResolvedSubmissionPath = (component: Component) => {
  if (component.type === 'attachment') {
    return component.baseSubmissionPath ? `${component.baseSubmissionPath}.${component.key}` : component.key;
  }

  return submissionUtils.getComponentSubmissionPath(component, component.baseSubmissionPath ?? '');
};

const enrichComponentsWithBaseSubmissionPath = (components: Component[] = [], baseSubmissionPath = ''): Component[] =>
  components.map((component) => {
    const { components: childComponents, ...rest } = component;
    const nextBaseSubmissionPath =
      rest.yourInformation && rest.type === 'container'
        ? [baseSubmissionPath, rest.key].filter(Boolean).join('.')
        : getResolvedSubmissionPath({
            ...rest,
            baseSubmissionPath,
          });

    return {
      ...rest,
      baseSubmissionPath,
      ...(childComponents && {
        components: enrichComponentsWithBaseSubmissionPath(childComponents, nextBaseSubmissionPath),
      }),
    };
  });

const enrichFormWithBaseSubmissionPath = (form: Form): Form => ({
  ...form,
  components: enrichComponentsWithBaseSubmissionPath(form.components),
});

const flattenComponentsWithBaseSubmissionPath = (components: Component[]): ComponentDefinition[] =>
  toComponentDefinitions(navFormUtils.flattenComponents(components));

export {
  enrichComponentsWithBaseSubmissionPath,
  enrichFormWithBaseSubmissionPath,
  flattenComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
  toComponentDefinitions,
};
