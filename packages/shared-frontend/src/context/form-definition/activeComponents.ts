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
import { isObjectRecord } from '../../utils/isObjectRecord';

const conditionallyTraversedTypes = new Set(['container', 'panel', 'fieldset', 'navSkjemagruppe']);

type ConditionRow = Parameters<typeof checkCondition>[1];

const getChildConditionRow = (component: Component, row: ConditionRow, data: SubmissionData): ConditionRow => {
  if (component.type !== 'container') {
    return row;
  }

  const parentRow = isObjectRecord(row) ? row : data;
  const value = parentRow[component.key];
  // An absent container must not fall back to the root condition scope.
  return isObjectRecord(value) ? value : {};
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
  const activeComponents: Component[] = [];

  components.forEach((component) => {
    if (evaluateConditionals && !checkCondition(component, row, data, form, undefined, submission, options)) {
      return;
    }

    if (!component.components) {
      activeComponents.push({ navId: getNavId(component), ...component });
      return;
    }

    const evaluateChildConditionals = evaluateConditionals && conditionallyTraversedTypes.has(component.type);
    activeComponents.push({
      ...component,
      components: resolveActiveComponents(
        component.components,
        form,
        submission,
        options,
        getChildConditionRow(component, row, data),
        evaluateChildConditionals,
      ),
    });
  });

  return activeComponents;
};

const getActivePanels = (form: Form, submission?: Submission, options?: CheckConditionOptions): Panel[] => {
  const resolvedSubmission = submission ?? { data: {} };
  const panels = form.components.filter((component): component is Panel => component.type === 'panel');

  return resolveActiveComponents(panels, form, resolvedSubmission, options) as Panel[];
};

export { getActivePanels };
