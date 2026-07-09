import { SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';

const setDeepValue = (target: SubmissionData, path: string[], value: unknown): SubmissionData => {
  const [key, ...rest] = path;
  if (rest.length === 0) {
    return { ...target, [key]: value as SubmissionData[string] };
  }
  return {
    ...target,
    [key]: setDeepValue((target?.[key] as SubmissionData) ?? {}, rest, value),
  };
};

const removeDeepValue = (target: SubmissionData, path: string[]): SubmissionData => {
  const [key, ...rest] = path;
  if (target?.[key] === undefined) {
    return target;
  }
  if (rest.length === 0) {
    const { [key]: _removed, ...remaining } = target;
    return remaining;
  }
  return {
    ...target,
    [key]: removeDeepValue((target[key] as SubmissionData) ?? {}, rest),
  };
};

export { removeDeepValue, setDeepValue };
