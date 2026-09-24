import { Submission, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { StateStoreProvider } from './StateContext';
import { parseSubmissionPath, removeDeepValue, setDeepValue } from './stateHelpers';

interface SubmissionStateContextType {
  submission?: Submission;
  setSubmission: Dispatch<SetStateAction<Submission | undefined>>;
  getLatestSubmission: () => Submission | undefined;
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

const clearSubmissionPathsFromSubmission = (
  submission: Submission | undefined,
  submissionPaths: string[],
): Submission | undefined => {
  if (submissionPaths.length === 0 || !submission?.data) {
    return submission;
  }

  const data = submissionPaths.reduce(
    (currentData, path) => removeDeepValue(currentData, parseSubmissionPath(path)),
    submission.data,
  );
  return data === submission.data ? submission : { ...submission, data };
};

const SubmissionStateContext = createContext<SubmissionStateContextType>({} as SubmissionStateContextType);

const SubmissionStateProvider = ({ children, initialSubmission }: Props) => {
  const [submission, setSubmissionState] = useState<Submission | undefined>(initialSubmission ?? { data: {} });
  const submissionRef = useRef<Submission | undefined>(initialSubmission ?? { data: {} });
  const fieldStateListenersRef = useRef(new Set<() => void>());

  const notifyFieldStateListeners = useCallback(() => {
    fieldStateListenersRef.current.forEach((listener) => listener());
  }, []);

  const setSubmission = useCallback<Dispatch<SetStateAction<Submission | undefined>>>(
    (nextSubmission) => {
      const previousSubmission = submissionRef.current;
      const resolvedSubmission =
        typeof nextSubmission === 'function' ? nextSubmission(previousSubmission) : nextSubmission;
      submissionRef.current = resolvedSubmission;
      setSubmissionState(resolvedSubmission);
      if (!Object.is(previousSubmission, resolvedSubmission)) {
        notifyFieldStateListeners();
      }
    },
    [notifyFieldStateListeners],
  );

  const getLatestSubmission = useCallback(() => submissionRef.current, []);

  const updateSubmission = useCallback(
    (submissionPath: string, value: unknown) => {
      setSubmission((prev) => {
        return createUpdatedSubmission(prev, submissionPath, value);
      });
    },
    [setSubmission],
  );

  const clearSubmissionPaths = useCallback(
    (submissionPaths: string[]) => {
      setSubmission((prev) => clearSubmissionPathsFromSubmission(prev, submissionPaths));
    },
    [setSubmission],
  );

  const value = useMemo(
    () => ({ submission, setSubmission, getLatestSubmission, updateSubmission, clearSubmissionPaths }),
    [submission, setSubmission, getLatestSubmission, updateSubmission, clearSubmissionPaths],
  );

  // Fyllut's implementation of the generic field state store. setValue updates the submission and
  // returns the next submission snapshot so scope-aware validation can revalidate synchronously.
  const store = useMemo(
    () => ({
      getValue: (statePath: string) => submissionUtils.getSubmissionValue(statePath, submissionRef.current),
      subscribe: (listener: () => void) => {
        fieldStateListenersRef.current.add(listener);
        return () => {
          fieldStateListenersRef.current.delete(listener);
        };
      },
      setValue: (statePath: string, fieldValue: unknown): Submission => {
        const nextSubmission = createUpdatedSubmission(submissionRef.current, statePath, fieldValue);
        setSubmission(nextSubmission);
        return nextSubmission;
      },
    }),
    [setSubmission],
  );

  return (
    <SubmissionStateContext.Provider value={value}>
      <StateStoreProvider store={store}>{children}</StateStoreProvider>
    </SubmissionStateContext.Provider>
  );
};

const useSubmissionState = () => useContext(SubmissionStateContext);

export { clearSubmissionPathsFromSubmission, createUpdatedSubmission, SubmissionStateProvider, useSubmissionState };
export type { SubmissionStateContextType };
