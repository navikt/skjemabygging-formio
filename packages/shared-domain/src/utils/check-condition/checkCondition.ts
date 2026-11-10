import { Component, Form, Submission } from '../../models';
import { createConditionInstance, shouldCreateSyntheticInstance } from './conditionInstance';
import { createCheckCustomConditional } from './customCondition';
import { checkSimpleConditional, hasUnsupportedConditional } from './simpleCondition';
import {
  CheckConditionOptions,
  ConditionComponent,
  ConditionData,
  ConditionRow,
  ConditionUtils,
  EvaluateFunction,
} from './types';

const getCheckConditionUtils = (Utils: ConditionUtils, evaluate: EvaluateFunction) => {
  const checkCustomConditional = createCheckCustomConditional(Utils, evaluate);

  const checkCondition = (
    component: Partial<Component>,
    row: ConditionRow,
    data: ConditionData | undefined,
    form?: Form,
    instance?: ConditionComponent,
    submission?: Submission,
    options?: CheckConditionOptions,
  ) => {
    if (component.customConditional) {
      const effectiveInstance =
        instance ?? createConditionInstance(component, form, evaluate, options?.submissionMethod);

      return checkCustomConditional(
        component,
        component.customConditional,
        row,
        data,
        form,
        'show',
        true,
        effectiveInstance,
        submission,
        options,
      );
    }

    if (hasUnsupportedConditional(component)) {
      console.warn(`Unsupported conditional type on component "${component.key}". Treating as visible.`);
      return true;
    }

    const effectiveInstance = shouldCreateSyntheticInstance(component, instance)
      ? createConditionInstance(component, form, evaluate, options?.submissionMethod)
      : instance;

    if (component.conditional?.when) {
      return checkSimpleConditional(component, row, data, form, effectiveInstance);
    }

    return true;
  };

  return {
    checkCustomConditional,
    checkCondition,
  };
};

export { getCheckConditionUtils };
export type { CheckConditionOptions };
export default getCheckConditionUtils;
