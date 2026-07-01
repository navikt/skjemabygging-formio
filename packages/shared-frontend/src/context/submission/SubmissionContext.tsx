import { Submission, SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useMemo, useState } from 'react';

interface SubmissionContextType {
  submission?: Submission;
  setSubmission: Dispatch<SetStateAction<Submission | undefined>>;
  updateSubmission: (submissionPath: string, value: unknown) => void;
  clearSubmissionPaths: (submissionPaths: string[]) => void;
}

interface Props {
  children: ReactNode;
  initialSubmission?: Submission;
}

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

const SubmissionContext = createContext<SubmissionContextType>({} as SubmissionContextType);

const SubmissionProvider = ({ children, initialSubmission }: Props) => {
  const [submission, setSubmission] = useState<Submission | undefined>(initialSubmission ?? { data: {} });

  const updateSubmission = useCallback((submissionPath: string, value: unknown) => {
    setSubmission((prev) => ({
      ...prev,
      data: setDeepValue(prev?.data ?? {}, submissionPath.split('.'), value),
    }));
  }, []);

  const clearSubmissionPaths = useCallback((submissionPaths: string[]) => {
    if (submissionPaths.length === 0) return;
    setSubmission((prev) => {
      if (!prev?.data) return prev;
      const data = submissionPaths.reduce((acc, path) => removeDeepValue(acc, path.split('.')), prev.data);
      return { ...prev, data };
    });
  }, []);

  const value = useMemo(
    () => ({ submission, setSubmission, updateSubmission, clearSubmissionPaths }),
    [submission, updateSubmission, clearSubmissionPaths],
  );

  return <SubmissionContext.Provider value={value}>{children}</SubmissionContext.Provider>;
};

const useSubmission = () => useContext(SubmissionContext);

export { removeDeepValue, setDeepValue, SubmissionProvider, useSubmission };
export type { SubmissionContextType };
