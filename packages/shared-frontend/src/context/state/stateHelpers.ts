import { SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';

type SubmissionPathPart = string | number;

const parseSubmissionPath = (path: string): SubmissionPathPart[] =>
  path
    .replace(/\[(\d+)]/g, '.$1')
    .split('.')
    .filter(Boolean)
    .map((part) => (/^\d+$/.test(part) ? Number(part) : part));

const isObjectLike = (value: unknown): value is SubmissionData =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

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

export { parseSubmissionPath, removeDeepValue, setDeepValue };
