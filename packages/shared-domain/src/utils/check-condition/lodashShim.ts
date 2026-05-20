import { ConditionData, ConditionInput, ConditionLibrary, ConditionObject, ConditionRow } from './types';

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

const isObjectLike = (value: ConditionData | ConditionRow | ConditionInput): value is ConditionObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const lodashShim: ConditionLibrary = {
  get: (obj: ConditionData | ConditionRow, path: string, defaultValue?: ConditionInput) => {
    const result = parsePath(path).reduce<ConditionInput | ConditionRow | ConditionData | undefined>(
      (acc, key) => (acc != null && isObjectLike(acc) ? acc[key] : undefined),
      obj,
    );

    return result === undefined ? defaultValue : result;
  },
  some: <T>(collection: T[] | Record<string, T> | null | undefined, predicate: (item: T) => boolean) =>
    toCollectionValues(collection).some(predicate),
  every: <T>(collection: T[] | Record<string, T> | null | undefined, predicate: (item: T) => boolean) =>
    toCollectionValues(collection).every(predicate),
};

export { lodashShim };
