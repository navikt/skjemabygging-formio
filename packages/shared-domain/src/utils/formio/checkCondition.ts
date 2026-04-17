import { Component, NavFormType, Submission, SubmissionMethod } from '../../models';
import { submissionTypesUtils } from '../submission';
import getFormioCheckConditionUtils from './formioCheckCondition';

const USE_FORMIO_CHECK_CONDITION = false;

const toCollectionValues = <T>(collection: T[] | Record<string, T> | null | undefined) => {
  if (collection == null) {
    return [];
  }

  return Array.isArray(collection) ? collection : Object.values(collection);
};

const lodashShim = {
  get: (obj: unknown, path: string, defaultValue?: unknown) => {
    const result = path.split('.').reduce<unknown>((acc, key) => (isObjectLike(acc) ? acc[key] : undefined), obj);

    return result === undefined ? defaultValue : result;
  },
  some: <T>(collection: T[] | Record<string, T> | null | undefined, predicate: (item: T) => boolean) =>
    toCollectionValues(collection).some(predicate),
  every: <T>(collection: T[] | Record<string, T> | null | undefined, predicate: (item: T) => boolean) =>
    toCollectionValues(collection).every(predicate),
};

const isNil = (value: unknown): value is null | undefined => value == null;

const isObjectLike = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isEmptyValue = (value: unknown) => {
  if (Array.isArray(value) || typeof value === 'string') {
    return value.length === 0;
  }

  if (isObjectLike(value)) {
    return Object.keys(value).length === 0;
  }

  return false;
};

const getByPath = (obj: unknown, path: string) =>
  path.split('.').reduce<unknown>((acc, key) => (isObjectLike(acc) ? acc[key] : undefined), obj);

const hasOwnKey = (value: unknown, key: string) => isObjectLike(value) && Object.hasOwn(value, key);

type ConditionComponent = Partial<Component> & {
  data?: unknown;
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

  return Boolean(component.customConditional || component.conditional?.when);
};

const normalizeConditionalValue = (value: unknown) => {
  if (isNil(value) || (isObjectLike(value) && isEmptyValue(value))) {
    return '';
  }

  return value;
};

const getEffectiveRowContext = (row: unknown, data: unknown, instance?: ConditionComponent) => {
  if (!isNil(row)) {
    return row;
  }

  if (!isNil(instance?.data)) {
    return instance.data;
  }

  return data;
};

const getDataParentPath = (instance?: ConditionComponent) => {
  const pathSegments: string[] = [];
  let current = instance?.parent;

  while (current) {
    if (current.type === 'datagrid' && current.key) {
      pathSegments.unshift(current.key);
    }
    current = current.parent;
  }

  return pathSegments.join('.');
};

const getScopedRowPath = (componentPath: string, instance?: ConditionComponent) => {
  const dataParentPath = getDataParentPath(instance);

  if (!dataParentPath) {
    return;
  }

  if (componentPath === dataParentPath) {
    return '';
  }

  const scopedPrefix = dataParentPath + '.';
  return componentPath.startsWith(scopedPrefix) ? componentPath.slice(scopedPrefix.length) : undefined;
};

const getComponentActualValue = (componentPath: string, data: unknown, row: unknown, instance?: ConditionComponent) => {
  const scopedRowPath = getScopedRowPath(componentPath, instance);

  if (row && scopedRowPath !== undefined) {
    const scopedRowValue = scopedRowPath ? getByPath(row, scopedRowPath) : row;
    if (!isNil(scopedRowValue)) {
      return normalizeConditionalValue(scopedRowValue);
    }
  }

  const dataValue = data ? getByPath(data, componentPath) : undefined;
  if (!isNil(dataValue)) {
    return normalizeConditionalValue(dataValue);
  }

  const rowValue = row ? getByPath(row, componentPath) : undefined;
  return normalizeConditionalValue(rowValue);
};

const checkSimpleConditional = (
  component: Partial<Component>,
  row: unknown,
  data: unknown,
  instance?: ConditionComponent,
) => {
  const condition = component.conditional;

  if (!condition) {
    return true;
  }

  if (condition.when) {
    const value = getComponentActualValue(condition.when, data, getEffectiveRowContext(row, data, instance), instance);
    const eq = String(condition.eq);
    const show = String(condition.show);

    if (isObjectLike(value) && hasOwnKey(value, String(condition.eq))) {
      return String((value as Record<string, unknown>)[String(condition.eq)]) === show;
    }

    if (Array.isArray(value) && value.map(String).includes(eq)) {
      return show === 'true';
    }

    return (String(value) === eq) === (show === 'true');
  }

  return true;
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
    form: NavFormType | undefined,
    variable,
    onError,
    instance,
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

    if (component.conditional?.when) {
      return checkSimpleConditional(component, row, data, effectiveInstance);
    }

    return true;
  };

  // This stays here for us to quickly change back to old formio check condition.
  // This should be deleted when we have run the new check condition for a while.
  if (USE_FORMIO_CHECK_CONDITION) {
    return getFormioCheckConditionUtils(Utils, evaluate, originalCheckCondition);
  }

  return {
    checkCustomConditional,
    checkCondition,
  };
};

export type { CheckConditionOptions };
export default getCheckConditionUtils;
