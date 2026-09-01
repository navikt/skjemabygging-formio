import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';

type FormActionStatus = 'idle' | 'saving' | 'submitting' | 'submitted';

// Coordinates action state around handlers supplied by the owning form flow.
interface FormActionHandlers {
  save?: (submission: Submission) => Promise<void>;
  submit?: (submission: Submission) => Promise<void>;
}

interface FormActionsContextValue {
  saveDraft: () => Promise<boolean>;
  submit: () => Promise<void>;
  status: FormActionStatus;
  error?: unknown;
  clearError: () => void;
  canSaveDraft: boolean;
  canSubmit: boolean;
}

interface Props extends FormActionHandlers {
  children: ReactNode;
}

const FormActionsContext = createContext<FormActionsContextValue>({} as FormActionsContextValue);

const FormActionsProvider = ({ children, save: saveHandler, submit: submitHandler }: Props) => {
  const { getLatestSubmission } = useSubmissionState();
  const [status, setStatus] = useState<FormActionStatus>('idle');
  const [error, setError] = useState<unknown>();
  const saveLoopRef = useRef<Promise<boolean> | null>(null);
  const hasQueuedSaveRef = useRef(false);

  const saveDraft = useCallback(async () => {
    if (!saveHandler) return false;

    hasQueuedSaveRef.current = true;
    if (!saveLoopRef.current) {
      saveLoopRef.current = (async () => {
        setStatus('saving');
        setError(undefined);

        try {
          while (hasQueuedSaveRef.current) {
            hasQueuedSaveRef.current = false;
            const latestSubmission = getLatestSubmission();
            if (!latestSubmission) {
              return false;
            }

            await saveHandler(latestSubmission);
          }
          return true;
        } catch (e) {
          setError(e);
          return false;
        } finally {
          saveLoopRef.current = null;
          setStatus('idle');
        }
      })();
    }

    const saveLoop = saveLoopRef.current;
    return saveLoop ? await saveLoop : false;
  }, [getLatestSubmission, saveHandler]);

  const submit = useCallback(async () => {
    if (!submitHandler) return;

    if (saveLoopRef.current && !(await saveLoopRef.current)) {
      return;
    }

    const latestSubmission = getLatestSubmission();
    if (!latestSubmission) return;

    setStatus('submitting');
    setError(undefined);
    try {
      await submitHandler(latestSubmission);
      setStatus('submitted');
    } catch (e) {
      setError(e);
      setStatus('idle');
    }
  }, [getLatestSubmission, submitHandler]);

  const clearError = useCallback(() => setError(undefined), []);

  const value = useMemo(
    () => ({
      saveDraft,
      submit,
      status,
      error,
      clearError,
      canSaveDraft: !!saveHandler,
      canSubmit: !!submitHandler,
    }),
    [saveDraft, submit, status, error, clearError, saveHandler, submitHandler],
  );

  return <FormActionsContext.Provider value={value}>{children}</FormActionsContext.Provider>;
};

const useFormActions = () => useContext(FormActionsContext);

export { FormActionsProvider, useFormActions };
export type { FormActionHandlers, FormActionsContextValue, FormActionStatus };
