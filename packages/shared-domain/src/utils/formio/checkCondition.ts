import _ from 'lodash';
import { Component, NavFormType, Submission, SubmissionMethod } from '../../models';
import { submissionTypesUtils } from '../submission';

const USE_FORMIO_CHECK_CONDITION = false;

const lodashShim = {
  some: <T>(collection: T[], predicate: (item: T) => boolean) => Array.from(collection).some(predicate),
  every: <T>(collection: T[], predicate: (item: T) => boolean) => Array.from(collection).every(predicate),
  get: (obj: unknown, path: string, defaultValue?: unknown) => {
    const result = path
      .split('.')
      .reduce<unknown>((acc, key) => (acc != null ? (acc as Record<string, unknown>)[key] : undefined), obj);
    return result === undefined ? defaultValue : result;
  },
};

type ConditionComponent = Partial<Component> & {
  parent?: ConditionComponent;
  evaluate?: (func: unknown, args: Record<string, unknown>, ret?: string, tokenize?: boolean) => unknown;
  isSubmissionPaper?: () => boolean;
  isSubmissionDigital?: () => boolean;
  isSubmissionNologin?: () => boolean;
};

interface CheckConditionOptions {
  submissionMethod?: SubmissionMethod;
}

const inferSubmissionMethod = (form?: NavFormType, submissionMethod?: SubmissionMethod) => {
  if (submissionMethod) {
    return submissionMethod;
  }

  if (form?.properties?.submissionTypes?.length === 1) {
    return submissionTypesUtils.asMethod(form.properties.submissionTypes[0]);
  }
};

const isSameComponent = (target: Partial<Component>, candidate: Partial<Component>) => {
  if (target.navId && candidate.navId) {
    return target.navId === candidate.navId;
  }

  if (target.id && candidate.id) {
    return target.id === candidate.id;
  }

  return target.key === candidate.key && target.type === candidate.type;
};

const toConditionComponent = (component: Component, parent?: ConditionComponent): ConditionComponent => {
  const { components: _components, ...rest } = component;
  return {
    ...rest,
    parent,
  };
};

const findComponentWithParents = (
  components: Component[] | undefined,
  target: Partial<Component>,
  parent?: ConditionComponent,
): ConditionComponent | undefined => {
  for (const component of components ?? []) {
    const candidate = toConditionComponent(component, parent);

    if (isSameComponent(target, component)) {
      return candidate;
    }

    const match = findComponentWithParents(component.components, target, candidate);
    if (match) {
      return match;
    }
  }

  return undefined;
};

const createConditionInstance = (
  component: Partial<Component>,
  form: NavFormType | undefined,
  evaluate: (func: unknown, args: Record<string, unknown>, ret?: string, tokenize?: boolean) => unknown,
  submissionMethod?: SubmissionMethod,
): ConditionComponent => {
  const resolvedComponent = findComponentWithParents(form?.components, component) ?? { ...component };
  const resolvedSubmissionMethod = inferSubmissionMethod(form, submissionMethod);
  const conditionInstance: ConditionComponent = {
    ...resolvedComponent,
    isSubmissionPaper: () => resolvedSubmissionMethod === 'paper' || !resolvedSubmissionMethod,
    isSubmissionDigital: () => resolvedSubmissionMethod === 'digital',
    isSubmissionNologin: () => resolvedSubmissionMethod === 'digitalnologin',
  };

  conditionInstance.evaluate = (func, args, ret?, tokenize?) => {
    return evaluate(func, { component, instance: conditionInstance, ...args }, ret, tokenize);
  };

  return conditionInstance;
};

const shouldCreateSyntheticInstance = (component: Partial<Component>, instance?: ConditionComponent) => {
  if (instance) {
    return false;
  }

  return Boolean(component.customConditional || component.conditional?.when || component.conditional?.json);
};

const getCheckConditionUtils = (
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

  const checkCustomConditional = (
    component: Partial<Component>,
    custom,
    row,
    data,
    form: NavFormType | undefined,
    variable,
    onError,
    instance,
    submission?: Submission,
    options?: CheckConditionOptions,
  ) => {
    const effectiveInstance = instance ?? createConditionInstance(component, form, evaluate, options?.submissionMethod);

    if (typeof custom === 'string') {
      custom = `var ${variable} = true; ${custom}; return ${variable};`;
    }

    const evaluateArgs = {
      row,
      data,
      form,
      component,
      instance: effectiveInstance,
      utils: Utils,
      ...(submission && { submission }),
      _: lodashShim,
    };

    const value =
      effectiveInstance && effectiveInstance.evaluate
        ? effectiveInstance.evaluate(custom, evaluateArgs)
        : evaluate(custom, evaluateArgs);

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

  const checkCondition = (
    component: Partial<Component>,
    row,
    data,
    form?: NavFormType,
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

    const effectiveInstance = shouldCreateSyntheticInstance(component, instance)
      ? createConditionInstance(component, form, evaluate, options?.submissionMethod)
      : instance;

    return originalCheckCondition(component, row, data, form, effectiveInstance);
  };

  // This stays here for us to quickly change back to old formio check condition.
  // This should be deleted when we have run the new check condition for a while.
  if (USE_FORMIO_CHECK_CONDITION) {
    return {
      checkCustomConditional: formioCheckCustomConditional,
      checkCondition: formioCheckCondition,
    };
  }

  return {
    checkCustomConditional,
    checkCondition,
  };
};

export type { CheckConditionOptions };
export default getCheckConditionUtils;
