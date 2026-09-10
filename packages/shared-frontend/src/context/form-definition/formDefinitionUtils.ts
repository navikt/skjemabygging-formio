import {
  Component,
  flattenComponents,
  Form,
  formSummaryUtils,
  getNavId,
  Panel,
  Submission,
  submissionUtils,
  type CheckConditionOptions,
} from '@navikt/skjemadigitalisering-shared-domain';
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
  toComponentDefinitions(flattenComponents(components));

/**
 * Recursively keeps only components whose evaluated conditional is not `false`, and stamps leaf
 * components with a resolved `navId` (falling back to `id`) so downstream consumers can key on it
 * without re-deriving it.
 */
const filterActiveComponents = (components: Component[], conditionals: Record<string, boolean>): Component[] =>
  components
    .filter((component) => conditionals[formSummaryUtils.createComponentKeyWithNavId(component)] !== false)
    .map((component) =>
      component.components
        ? { ...component, components: filterActiveComponents(component.components, conditionals) }
        : { navId: getNavId(component), ...component },
    );

/**
 * Every active top-level panel, in authored order, with inactive descendants filtered out.
 *
 * Unlike the legacy `navFormUtils.getActiveComponentsFromForm`/`getAllActivePanelsFromForm` pair,
 * there is a single function: the new renderer does not treat the attachment panel as a separate
 * navigation/rendering concern, so there is nothing to special-case.
 */
const getActivePanels = (form: Form, submission?: Submission, options?: CheckConditionOptions): Panel[] => {
  const conditionals = formSummaryUtils.mapAndEvaluateConditionals(form, submission ?? { data: {} }, options);
  const panels = form.components.filter((component): component is Panel => component.type === 'panel');
  return filterActiveComponents(panels, conditionals) as Panel[];
};

export {
  enrichComponentsWithBaseSubmissionPath,
  enrichFormWithBaseSubmissionPath,
  flattenComponentsWithBaseSubmissionPath,
  getActivePanels,
  getResolvedSubmissionPath,
  toComponentDefinitions,
};
