import _ from 'lodash';
import { Component, NavFormType, Submission, SubmissionMethod } from '../../models';

type ConditionComponent = Partial<Component> & {
  evaluate?: (func: unknown, args: Record<string, unknown>, ret?: string, tokenize?: boolean) => unknown;
};

interface CheckConditionOptions {
  submissionMethod?: SubmissionMethod;
}

const getFormioCheckConditionUtils = (
  Utils,
  evaluate: (func: unknown, args: Record<string, unknown>, ret?: string, tokenize?: boolean) => unknown,
  originalCheckCondition,
) => {
  const formioCheckCustomConditional = (
    _component: Partial<Component>,
    custom,
    row,
    data,
    form: NavFormType | undefined,
    variable,
    onError,
    instance,
    submission?: Submission,
    _options?: CheckConditionOptions,
  ) => {
    if (typeof custom === 'string') {
      custom = `var ${variable} = true; ${custom}; return ${variable};`;
    }

    const evaluateArgs = {
      row,
      data,
      form,
      utils: Utils,
      ...(submission && { submission }),
      _: _,
    };

    const value =
      instance && instance.evaluate ? instance.evaluate(custom, evaluateArgs) : evaluate(custom, evaluateArgs);

    if (value === null) {
      return onError;
    }

    return value;
  };

  const formioCheckCondition = (
    component: Partial<Component>,
    row,
    data,
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
