import { Component, NavFormType } from '../../models';
import { ConditionComponent, ConditionData, ConditionInput, ConditionObject, ConditionRow } from './types';

const isNil = (value: ConditionInput | ConditionRow | ConditionData | undefined) => value == null;

const isObjectLike = (value: ConditionInput | ConditionRow | ConditionData): value is ConditionObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isEmptyValue = (value: ConditionInput) => {
  if (Array.isArray(value) || typeof value === 'string') {
    return value.length === 0;
  }

  if (isObjectLike(value)) {
    return Object.keys(value).length === 0;
  }

  return false;
};

const getByPath = (obj: ConditionInput | ConditionRow | ConditionData, path: string): ConditionInput | undefined => {
  const keys = path.split('.');

  const traverse = (
    value: ConditionInput | ConditionRow | ConditionData | undefined,
    keyIndex: number,
  ): ConditionInput | undefined => {
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

const normalizeConditionalValue = (value: ConditionInput | undefined) => {
  if (isNil(value) || (isObjectLike(value) && isEmptyValue(value))) {
    return '';
  }

  return value;
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
  source: ConditionData | ConditionRow;
  path: string;
}

/**
 * Resolves the value used by a simple conditional from row-scoped context or submission data.
 */
const getComponentActualValue = (
  componentPath: string,
  data: ConditionData | undefined,
  row: ConditionRow,
  instance?: ConditionComponent,
  form?: NavFormType,
) => {
  const candidates: ValueCandidate[] = [];
  const scopedPaths = getScopedRowPaths(componentPath, instance);
  const rowSources = [row, instance?.data].filter((source): source is ConditionData | ConditionRow => !isNil(source));

  for (const source of rowSources) {
    for (const scopedPath of scopedPaths) {
      candidates.push({ source, path: scopedPath });
    }
  }

  if (!instance || hasDatagridAncestor(instance)) {
    for (const source of rowSources) {
      for (const suffix of getPathSuffixes(componentPath)) {
        candidates.push({ source, path: suffix });
      }
    }
  }

  if (!isNil(data)) {
    candidates.push({ source: data, path: componentPath });
  }

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

export { getComponentActualValue };
