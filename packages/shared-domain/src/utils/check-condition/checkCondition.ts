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

const getByPath = (obj: unknown, path: string): unknown => {
  const keys = path.split('.');

  const getNestedValue = (value: unknown, keyIndex: number): unknown => {
    if (keyIndex >= keys.length) {
      return value;
    }

    if (Array.isArray(value)) {
      const arrayValues = value
        .map((item) => getNestedValue(item, keyIndex))
        .flatMap((item) => (Array.isArray(item) ? item : [item]))
        .filter((item) => !isNil(item));

      return arrayValues.length > 0 ? arrayValues : undefined;
    }

    if (isObjectLike(value)) {
      return getNestedValue(value[keys[keyIndex]], keyIndex + 1);
    }

    return undefined;
  };

  return getNestedValue(obj, 0);
};

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
  if (!isNil(row) && !Array.isArray(row)) {
    return row;
  }

  if (!isNil(instance?.data)) {
    return instance.data;
  }

  return data;
};

const getRelevantParentKeys = (instance?: ConditionComponent) => {
  const parentKeys: string[] = [];
  let current = instance?.parent;

  while (current) {
    if (current.key && !['panel', 'fieldset', 'navSkjemagruppe'].includes(current.type ?? '')) {
      parentKeys.unshift(current.key);
    }
    current = current.parent;
  }

  return parentKeys;
};

const getScopedRowPaths = (componentPath: string, instance?: ConditionComponent) => {
  const relevantParentKeys = getRelevantParentKeys(instance);
  const scopedRowPaths: string[] = [];

  for (let index = relevantParentKeys.length; index > 0; index -= 1) {
    const scopedPrefix = relevantParentKeys.slice(0, index).join('.');

    if (componentPath === scopedPrefix) {
      scopedRowPaths.push('');
      continue;
    }

    const nestedPrefix = scopedPrefix + '.';
    if (componentPath.startsWith(nestedPrefix)) {
      scopedRowPaths.push(componentPath.slice(nestedPrefix.length));
    }
  }

  return scopedRowPaths;
};

const getPathSuffixes = (path: string) => {
  const pathSegments = path.split('.');
  const pathSuffixes: string[] = [];

  for (let index = 1; index < pathSegments.length; index += 1) {
    pathSuffixes.push(pathSegments.slice(index).join('.'));
  }

  return pathSuffixes;
};

const wrapValueWithPath = (value: unknown, path: string) =>
  path
    .split('.')
    .slice(0, -1)
    .reduceRight<unknown>(
      (wrappedValue, pathSegment) => ({
        [pathSegment]: wrappedValue,
      }),
      value,
    );

const wrapRowWithParentKeys = (row: unknown, instance?: ConditionComponent) =>
  getRelevantParentKeys(instance).reduceRight<unknown>(
    (wrappedRow, parentKey) => ({
      [parentKey]: wrappedRow,
    }),
    row,
  );

const hasDatagridAncestor = (instance?: ConditionComponent) => {
  let current = instance?.parent;

  while (current) {
    if (current.type === 'datagrid') {
      return true;
    }

    current = current.parent;
  }

  return false;
};

const getComponentActualValue = (componentPath: string, data: unknown, row: unknown, instance?: ConditionComponent) => {
  if (!isNil(row)) {
    for (const scopedRowPath of getScopedRowPaths(componentPath, instance)) {
      const scopedRowValue = scopedRowPath ? getByPath(row, scopedRowPath) : row;
      if (!isNil(scopedRowValue)) {
        return normalizeConditionalValue(scopedRowValue);
      }

      if (scopedRowPath) {
        const wrappedScopedRowValue = getByPath(wrapValueWithPath(row, scopedRowPath), scopedRowPath);
        if (!isNil(wrappedScopedRowValue)) {
          return normalizeConditionalValue(wrappedScopedRowValue);
        }
      }
    }

    const wrappedRowValue = getByPath(wrapRowWithParentKeys(row, instance), componentPath);
    if (!isNil(wrappedRowValue)) {
      return normalizeConditionalValue(wrappedRowValue);
    }

    if (hasDatagridAncestor(instance)) {
      for (const rowPathSuffix of getPathSuffixes(componentPath)) {
        const rowPathSuffixValue = getByPath(row, rowPathSuffix);
        if (!isNil(rowPathSuffixValue)) {
          return normalizeConditionalValue(rowPathSuffixValue);
        }

        const wrappedRowPathSuffixValue = getByPath(wrapValueWithPath(row, rowPathSuffix), rowPathSuffix);
        if (!isNil(wrappedRowPathSuffixValue)) {
          return normalizeConditionalValue(wrappedRowPathSuffixValue);
        }
      }
    }
  }

  for (const scopedDataPath of getScopedRowPaths(componentPath, instance)) {
    const scopedDataValue = scopedDataPath ? getByPath(data, scopedDataPath) : data;
    if (!isNil(scopedDataValue)) {
      return normalizeConditionalValue(scopedDataValue);
    }

    if (scopedDataPath) {
      const wrappedScopedDataValue = getByPath(wrapValueWithPath(data, scopedDataPath), scopedDataPath);
      if (!isNil(wrappedScopedDataValue)) {
        return normalizeConditionalValue(wrappedScopedDataValue);
      }
    }
  }

  const wrappedDataValue = !isNil(data) ? getByPath(wrapRowWithParentKeys(data, instance), componentPath) : undefined;
  if (!isNil(wrappedDataValue)) {
    return normalizeConditionalValue(wrappedDataValue);
  }

  if (hasDatagridAncestor(instance)) {
    for (const dataPathSuffix of getPathSuffixes(componentPath)) {
      const dataPathSuffixValue = getByPath(data, dataPathSuffix);
      if (!isNil(dataPathSuffixValue)) {
        return normalizeConditionalValue(dataPathSuffixValue);
      }

      const wrappedDataPathSuffixValue = getByPath(wrapValueWithPath(data, dataPathSuffix), dataPathSuffix);
      if (!isNil(wrappedDataPathSuffixValue)) {
        return normalizeConditionalValue(wrappedDataPathSuffixValue);
      }
    }
  }

  const dataValue = !isNil(data) ? getByPath(data, componentPath) : undefined;
  if (!isNil(dataValue)) {
    return normalizeConditionalValue(dataValue);
  }

  const rowValue = !isNil(row) ? getByPath(row, componentPath) : undefined;
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
