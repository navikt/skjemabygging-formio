import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useMemo, useState } from 'react';

import { parseSubmissionPath, removeDeepValue, setDeepValue } from './stateHelpers';

interface SubmissionStateContextType {
  submission?: Submission;
  setSubmission: Dispatch<SetStateAction<Submission | undefined>>;
  updateSubmission: (submissionPath: string, value: unknown) => void;
  clearSubmissionPaths: (submissionPaths: string[]) => void;
}

interface Props {
  children: ReactNode;
  initialSubmission?: Submission;
}

const createUpdatedSubmission = (
  submission: Submission | undefined,
  submissionPath: string,
  value: unknown,
): Submission => ({
  ...(submission ?? { data: {} }),
  data: setDeepValue(submission?.data ?? {}, parseSubmissionPath(submissionPath), value),
});

const SubmissionStateContext = createContext<SubmissionStateContextType>({} as SubmissionStateContextType);

const SubmissionStateProvider = ({ children, initialSubmission }: Props) => {
  const [submission, setSubmission] = useState<Submission | undefined>(initialSubmission ?? { data: {} });

  const updateSubmission = useCallback((submissionPath: string, value: unknown) => {
    setSubmission((prev) => createUpdatedSubmission(prev, submissionPath, value));
  }, []);

  const clearSubmissionPaths = useCallback((submissionPaths: string[]) => {
    if (submissionPaths.length === 0) return;
    setSubmission((prev) => {
      if (!prev?.data) return prev;
      const data = submissionPaths.reduce((acc, path) => removeDeepValue(acc, parseSubmissionPath(path)), prev.data);
      return { ...prev, data };
    });
  }, []);

  const value = useMemo(
    () => ({ submission, setSubmission, updateSubmission, clearSubmissionPaths }),
    [submission, updateSubmission, clearSubmissionPaths],
  );

  return <SubmissionStateContext.Provider value={value}>{children}</SubmissionStateContext.Provider>;
};

const useSubmissionState = () => useContext(SubmissionStateContext);

export { createUpdatedSubmission, SubmissionStateProvider, useSubmissionState };
export type { SubmissionStateContextType };
