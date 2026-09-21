import {
  checkCondition,
  Component,
  Form,
  getNavId,
  Panel,
  Submission,
  type CheckConditionOptions,
  type SubmissionData,
} from '@navikt/skjemadigitalisering-shared-domain';
import { isVisibleComponent } from './componentVisibility';

const conditionallyTraversedTypes = new Set(['container', 'panel', 'fieldset', 'navSkjemagruppe']);

type ConditionRow = Parameters<typeof checkCondition>[1];

const getChildConditionRow = (component: Component, data: SubmissionData): ConditionRow => {
  if (component.type !== 'container') {
    return [];
  }

  const value = data[component.key];
  return typeof value === 'object' && value !== null ? value : undefined;
};

const resolveActiveComponents = (
  components: Component[],
  form: Form,
  submission: Submission,
  options: CheckConditionOptions | undefined,
  row: ConditionRow = [],
  evaluateConditionals = true,
): Component[] => {
  const data = submission.data ?? {};

  return components.reduce<Component[]>((activeComponents, component) => {
    if (
      !isVisibleComponent(component) ||
      (evaluateConditionals && !checkCondition(component, row, data, form, undefined, submission, options))
    ) {
      return activeComponents;
    }

    if (!component.components) {
      return [...activeComponents, { navId: getNavId(component), ...component }];
    }

    const evaluateChildConditionals = evaluateConditionals && conditionallyTraversedTypes.has(component.type);
    return [
      ...activeComponents,
      {
        ...component,
        components: resolveActiveComponents(
          component.components,
          form,
          submission,
          options,
          getChildConditionRow(component, data),
          evaluateChildConditionals,
        ),
      },
    ];
  }, []);
};

const getActivePanels = (form: Form, submission?: Submission, options?: CheckConditionOptions): Panel[] => {
  const resolvedSubmission = submission ?? { data: {} };
  const panels = form.components.filter((component): component is Panel => component.type === 'panel');

  return resolveActiveComponents(panels, form, resolvedSubmission, options) as Panel[];
};

export { getActivePanels };
