import { SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';

type SubmissionPathPart = string | number;

const parseSubmissionPath = (path: string): SubmissionPathPart[] => {
  const parts: SubmissionPathPart[] = [];

  for (const segment of path.split('.').filter(Boolean)) {
    const matches = segment.matchAll(/([^[\]]+)|\[(\d+)\]/g);
    for (const match of matches) {
      if (match[1]) {
        parts.push(match[1]);
      } else if (match[2]) {
        parts.push(Number(match[2]));
      }
    }
  }

  return parts;
};

const isObjectLike = (value: unknown): value is SubmissionData =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isSameSubmissionValue = (source: unknown, target: unknown): boolean => {
  if (Object.is(source, target)) {
    return true;
  }
  if (typeof source !== 'object' || typeof target !== 'object' || source === null || target === null) {
    return false;
  }
  if (Array.isArray(source) || Array.isArray(target)) {
    return (
      Array.isArray(source) &&
      Array.isArray(target) &&
      source.length === target.length &&
      source.every((item, index) => isSameSubmissionValue(item, target[index]))
    );
  }

  const sourceRecord = source as Record<string, unknown>;
  const targetRecord = target as Record<string, unknown>;
  const sourceKeys = Object.keys(sourceRecord);

  return (
    sourceKeys.length === Object.keys(targetRecord).length &&
    sourceKeys.every(
      (key) => Object.hasOwn(targetRecord, key) && isSameSubmissionValue(sourceRecord[key], targetRecord[key]),
    )
  );
};

const setDeepValue = (
  target: SubmissionData | unknown[],
  path: SubmissionPathPart[],
  value: unknown,
): SubmissionData => {
  const [key, ...rest] = path;
  if (typeof key === 'number') {
    const arrayTarget = Array.isArray(target) ? [...target] : [];
    if (rest.length === 0) {
      arrayTarget[key] = value;
      return arrayTarget as unknown as SubmissionData;
    }
    arrayTarget[key] = setDeepValue((arrayTarget[key] as SubmissionData | unknown[]) ?? {}, rest, value);
    return arrayTarget as unknown as SubmissionData;
  }

  const objectTarget = isObjectLike(target) ? target : {};
  if (rest.length === 0) {
    return { ...objectTarget, [key]: value as SubmissionData[string] };
  }
  return {
    ...objectTarget,
    [key]: setDeepValue((objectTarget[key] as SubmissionData | unknown[]) ?? {}, rest, value),
  };
};

const removeDeepValue = (target: SubmissionData | unknown[], path: SubmissionPathPart[]): SubmissionData => {
  const [key, ...rest] = path;
  if (typeof key === 'number') {
    if (!Array.isArray(target) || target[key] === undefined) {
      return target as SubmissionData;
    }
    const arrayTarget = [...target];
    if (rest.length === 0) {
      arrayTarget.splice(key, 1);
      return arrayTarget as unknown as SubmissionData;
    }
    const updatedChild = removeDeepValue((arrayTarget[key] as SubmissionData | unknown[]) ?? {}, rest);
    if (updatedChild === arrayTarget[key]) {
      return target as unknown as SubmissionData;
    }
    arrayTarget[key] = updatedChild;
    return arrayTarget as unknown as SubmissionData;
  }

  if (!isObjectLike(target) || target[key] === undefined) {
    return target as SubmissionData;
  }
  if (rest.length === 0) {
    const { [key]: _removed, ...remaining } = target;
    return remaining;
  }
  const updatedChild = removeDeepValue((target[key] as SubmissionData | unknown[]) ?? {}, rest);
  if (updatedChild === target[key]) {
    return target;
  }
  return {
    ...target,
    [key]: updatedChild,
  };
};

export { isSameSubmissionValue, parseSubmissionPath, removeDeepValue, setDeepValue };
