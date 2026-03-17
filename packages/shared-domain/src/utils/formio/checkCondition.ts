import { Component, NavFormType, Submission, SubmissionMethod } from '../../models';
import { submissionTypesUtils } from '../submission';

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

type LegacyForm = NavFormType & {
  properties?: NavFormType['properties'] & {
    innsending?: string;
  };
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

const legacySubmissionMethods: Record<string, SubmissionMethod | undefined> = {
  KUN_DIGITAL: 'digital',
  KUN_PAPIR: 'paper',
  KUN_DIGITAL_UTEN_INNLOGGING: 'digitalnologin',
};

const inferSubmissionMethod = (form?: LegacyForm, submissionMethod?: SubmissionMethod) => {
  if (submissionMethod) {
    return submissionMethod;
  }

  if (form?.properties?.submissionTypes?.length === 1) {
    return submissionTypesUtils.asMethod(form.properties.submissionTypes[0]);
  }

  return legacySubmissionMethods[form?.properties?.innsending ?? ''];
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
  form: LegacyForm | undefined,
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
  const checkCustomConditional = (
    component: Partial<Component>,
    custom,
    row,
    data,
    form: LegacyForm | undefined,
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

  const checkCondition = (
    component: Partial<Component>,
    row,
    data,
    form?: LegacyForm,
    instance?,
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

  return {
    checkCustomConditional,
    checkCondition,
  };
};

export type { CheckConditionOptions };
export default getCheckConditionUtils;
