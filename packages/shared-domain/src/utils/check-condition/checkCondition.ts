import { Component, NavFormType, Submission, SubmissionMethod } from '../../models';
import { submissionTypesUtils } from '../submission/submissionTypesUtils';
import getFormioCheckConditionUtils from './formioCheckCondition';

const USE_FORMIO_CHECK_CONDITION = false;

const toCollectionValues = <T>(collection: T[] | Record<string, T> | null | undefined) => {
  if (collection == null) {
    return [];
  }

  return Array.isArray(collection) ? collection : Object.values(collection);
};

const parsePath = (path: string): string[] =>
  path
    .replace(/\[(\d+)]/g, '.$1')
    .split('.')
    .filter(Boolean);

const lodashShim = {
  get: (obj: unknown, path: string, defaultValue?: unknown) => {
    const result = parsePath(path).reduce<unknown>((acc, key) => (isObjectLike(acc) ? acc[key] : undefined), obj);

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

  const traverse = (value: unknown, keyIndex: number): unknown => {
    if (keyIndex >= keys.length) {
      return value;
    }

    if (Array.isArray(value)) {
      const arrayValues = value
        .map((item) => traverse(item, keyIndex))
        .flatMap((item) => (Array.isArray(item) ? item : [item]))
        .filter((item) => !isNil(item));

      return arrayValues.length > 0 ? arrayValues : undefined;
    }

    if (isObjectLike(value)) {
      return traverse(value[keys[keyIndex]], keyIndex + 1);
    }

    return undefined;
  };

  return traverse(obj, 0);
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

const NON_DATA_PARENT_TYPES = ['panel', 'fieldset', 'navSkjemagruppe'];

const contributesToDataPath = (component: Partial<Component>) =>
  Boolean(component.key && component.tree !== false && !NON_DATA_PARENT_TYPES.includes(component.type ?? ''));

const getRelevantParentKeys = (instance?: ConditionComponent) => {
  const parentKeys: string[] = [];
  let current = instance?.parent;

  while (current) {
    if (current.key && !NON_DATA_PARENT_TYPES.includes(current.type ?? '')) {
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

const findComponentDataPathsByKey = (
  components: Component[] | undefined,
  targetKey: string,
  parentPath: string[] = [],
): string[] => {
  const paths: string[] = [];

  for (const component of components ?? []) {
    const nextPath = contributesToDataPath(component) ? [...parentPath, component.key!] : parentPath;

    if (component.key === targetKey && nextPath.length > 0) {
      paths.push(nextPath.join('.'));
    }

    if (component.components?.length) {
      paths.push(...findComponentDataPathsByKey(component.components, targetKey, nextPath));
    }
  }

  return paths;
};

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

interface ValueCandidate {
  source: unknown;
  path: string;
}

/**
 * Resolves the value of a referenced component from either row (scoped context)
 * or data (full submission). Returns the first non-nil match, normalized.
 *
 * Resolution order:
 *   1. Row-scoped paths — strip parent key prefixes from componentPath
 *   2. Row path suffixes — for datagrid/no-instance cross-scope references
 *   3. Data direct — full componentPath against submission data (array-aware)
 *   4. Row direct — full componentPath against row (last resort)
 */
const getComponentActualValue = (
  componentPath: string,
  data: unknown,
  row: unknown,
  instance?: ConditionComponent,
  form?: NavFormType,
) => {
  const candidates: ValueCandidate[] = [];
  const scopedPaths = getScopedRowPaths(componentPath, instance);
  const rowSources = [row, instance?.data].filter((source) => !isNil(source));

  // 1. Row-scoped paths (strip parent key prefixes)
  for (const source of rowSources) {
    for (const scopedPath of scopedPaths) {
      candidates.push({ source, path: scopedPath });
    }
  }

  // 2. Row path suffixes (only when no instance or inside datagrid)
  if (!instance || hasDatagridAncestor(instance)) {
    for (const source of rowSources) {
      for (const suffix of getPathSuffixes(componentPath)) {
        candidates.push({ source, path: suffix });
      }
    }
  }

  // 3. Full data path (direct, array-aware)
  if (!isNil(data)) {
    candidates.push({ source: data, path: componentPath });
  }

  // 4. Row with full component path (last resort)
  for (const source of rowSources) {
    candidates.push({ source, path: componentPath });
  }

  for (const { source, path } of candidates) {
    const value = path ? getByPath(source, path) : source;
    if (!isNil(value)) {
      return normalizeConditionalValue(value);
    }
  }

  if (!componentPath.includes('.') && form && !isNil(data)) {
    const formDataPaths = findComponentDataPathsByKey(form.components, componentPath);

    for (const path of formDataPaths) {
      const value = getByPath(data, path);
      if (!isNil(value)) {
        return normalizeConditionalValue(value);
      }
    }
  }

  return normalizeConditionalValue(undefined);
};

const checkSimpleConditional = (
  component: Partial<Component>,
  row: unknown,
  data: unknown,
  form: NavFormType | undefined,
  instance?: ConditionComponent,
) => {
  const condition = component.conditional;

  if (!condition) {
    return true;
  }

  if (condition.when) {
    const value = getComponentActualValue(condition.when, data, row, instance, form);
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

const hasUnsupportedConditional = (component: Partial<Component>) => {
  const conditional = component.conditional;
  if (!conditional) {
    return false;
  }

  return Boolean(
    ('json' in conditional && conditional.json) || ('conditions' in conditional && conditional.conditions),
  );
};

const getCheckConditionUtils = (
  Utils,
  evaluate: (func: unknown, args: Record<string, unknown>, ret?: string, tokenize?: boolean) => unknown,
  originalCheckCondition,
) => {
  // Quick switchback to FormioJS condition logic.
  // Delete this once the custom implementation has been validated in production.
  if (USE_FORMIO_CHECK_CONDITION) {
    return getFormioCheckConditionUtils(Utils, evaluate, originalCheckCondition);
  }

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
