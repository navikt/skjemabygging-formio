import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useAttachmentUpload } from '../../../context/attachment/AttachmentUploadContext';
import { useSubmissionActions } from '../../../context/state/SubmissionStateContext';
import { saveLatestSubmission } from './saveLatestSubmission';

type FormActionStatus = 'idle' | 'saving' | 'submitting' | 'submitted';

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
FormActionsContext.displayName = 'FormActionsContext';

const FormActionsProvider = ({ children, save: saveHandler, submit: submitHandler }: Props) => {
  const { getLatestSubmission } = useSubmissionActions();
  const { hasPendingOperations } = useAttachmentUpload();
  const [status, setStatus] = useState<FormActionStatus>('idle');
  const [error, setError] = useState<unknown>();
  const saveLoopRef = useRef<Promise<boolean> | null>(null);
  const submitInFlight = useRef(false);

  const saveDraft = useCallback(async () => {
    if (!saveHandler) return false;

    if (!saveLoopRef.current) {
      saveLoopRef.current = (async () => {
        setStatus((current) => (current === 'submitting' ? current : 'saving'));
        setError(undefined);

        try {
          return await saveLatestSubmission(getLatestSubmission, saveHandler);
        } catch (e) {
          setError(e);
          return false;
        } finally {
          saveLoopRef.current = null;
          setStatus((current) => (current === 'saving' ? 'idle' : current));
        }
      })();
    }

    const saveLoop = saveLoopRef.current;
    return saveLoop ? await saveLoop : false;
  }, [getLatestSubmission, saveHandler]);

  const submit = useCallback(async () => {
    if (!submitHandler || submitInFlight.current || hasPendingOperations()) return;

    // Two clicks can otherwise resume from the same pending draft save.
    submitInFlight.current = true;
    setStatus('submitting');
    setError(undefined);
    let submitted = false;
    try {
      if (saveLoopRef.current && !(await saveLoopRef.current)) return;
      if (hasPendingOperations()) return;

      const latestSubmission = getLatestSubmission();
      if (!latestSubmission) return;

      await submitHandler(latestSubmission);
      submitted = true;
    } catch (e) {
      setError(e);
    } finally {
      submitInFlight.current = false;
      const draftStatus = saveLoopRef.current ? 'saving' : 'idle';
      setStatus(submitted ? 'submitted' : draftStatus);
    }
  }, [getLatestSubmission, hasPendingOperations, submitHandler]);

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
