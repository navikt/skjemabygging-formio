import _ from 'lodash';
import { Component, NavFormType, Submission, SubmissionMethod } from '../../models';
import {
  ConditionComponent,
  ConditionData,
  ConditionEvaluationArgs,
  ConditionLibrary,
  ConditionResult,
  ConditionRow,
  ConditionUtils,
  OriginalCheckCondition,
} from './types';

interface CheckConditionOptions {
  submissionMethod?: SubmissionMethod;
}

const getFormioCheckConditionUtils = (
  Utils: ConditionUtils,
  evaluate: (func: string, args: ConditionEvaluationArgs, ret?: string, tokenize?: boolean) => ConditionResult,
  originalCheckCondition: OriginalCheckCondition,
) => {
  const lodashLibrary: ConditionLibrary = _;

  const formioCheckCustomConditional = (
    _component: Partial<Component>,
    custom: string,
    row: ConditionRow,
    data: ConditionData | undefined,
    form: NavFormType | undefined,
    variable: string,
    onError: boolean,
    instance?: ConditionComponent,
    submission?: Submission,
    _options?: CheckConditionOptions,
  ) => {
    if (typeof custom === 'string') {
      custom = `var ${variable} = true; ${custom}; return ${variable};`;
    }

    const evaluateArgs: ConditionEvaluationArgs = {
      row,
      data,
      form,
      utils: Utils,
      ...(submission && { submission }),
      _: lodashLibrary,
    };

    const value: ConditionResult =
      instance && instance.evaluate ? instance.evaluate(custom, evaluateArgs) : evaluate(custom, evaluateArgs);

    if (value === null) {
      return onError;
    }

    return value;
  };

  const formioCheckCondition = (
    component: Partial<Component>,
    row: ConditionRow,
    data: ConditionData | undefined,
    form?: NavFormType,
    instance?: ConditionComponent,
    submission?: Submission,
    options?: CheckConditionOptions,
  ) => {
    void options;

    if (component.customConditional) {
      return formioCheckCustomConditional(
        component,
        component.customConditional,
        row,
        data,
        form,
        'show',
        true,
        instance,
        submission,
      );
    }

    return originalCheckCondition(component, row, data, form, instance);
  };

  return {
    checkCustomConditional: formioCheckCustomConditional,
    checkCondition: formioCheckCondition,
  };
};

export default getFormioCheckConditionUtils;
