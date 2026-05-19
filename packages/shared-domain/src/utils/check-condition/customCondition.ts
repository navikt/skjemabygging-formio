import { Component, NavFormType, Submission } from '../../models';
import { createConditionInstance, getEffectiveRowContext } from './conditionInstance';
import { lodashShim } from './lodashShim';
import {
  CheckConditionOptions,
  ConditionComponent,
  ConditionData,
  ConditionResult,
  ConditionRow,
  ConditionUtils,
  EvaluateFunction,
} from './types';

const createCheckCustomConditional = (Utils: ConditionUtils, evaluate: EvaluateFunction) => {
  return (
    component: Partial<Component>,
    custom: string,
    row: ConditionRow,
    data: ConditionData | undefined,
    form: NavFormType | undefined,
    variable: string,
    onError: boolean,
    instance?: ConditionComponent,
    submission?: Submission,
    options?: CheckConditionOptions,
  ) => {
    const effectiveInstance = instance ?? createConditionInstance(component, form, evaluate, options?.submissionMethod);
    const effectiveRow = getEffectiveRowContext(row, data, effectiveInstance);

    if (typeof custom === 'string') {
      custom = `var ${variable} = true; ${custom}; return ${variable};`;
    }

    const evaluateArgs = {
      row: effectiveRow,
      data,
      form,
      component,
      instance: effectiveInstance,
      utils: Utils,
      ...(submission && { submission }),
      _: lodashShim,
    };

    const value: ConditionResult = effectiveInstance.evaluate
      ? effectiveInstance.evaluate(custom, evaluateArgs)
      : evaluate(custom, evaluateArgs);

    if (value === null) {
      return onError;
    }

    return value;
  };
};

export { createCheckCustomConditional };
