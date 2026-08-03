import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useSubmissionState } from '../state/SubmissionStateContext';

type PersistenceStatus = 'idle' | 'saving' | 'submitting' | 'submitted';

/**
 * Injected IO. shared-frontend never knows about concrete endpoints (mellomlagring, send-inn, pdf);
 * the consumer (fyllut/bygger/static-pdf) provides implementations. Mirrors how config/logger/http
 * are injected, keeping the framework decoupled and reusable.
 */
interface FormPersistenceHandlers {
  saveDraft?: (submission: Submission) => Promise<void>;
  submitForm?: (submission: Submission) => Promise<void>;
}

interface FormPersistenceContextType {
  saveDraft: () => Promise<boolean>;
  submit: () => Promise<void>;
  status: PersistenceStatus;
  error?: unknown;
  canSaveDraft: boolean;
  canSubmit: boolean;
}

interface Props extends FormPersistenceHandlers {
  children: ReactNode;
}

const FormPersistenceContext = createContext<FormPersistenceContextType>({} as FormPersistenceContextType);

const FormPersistenceProvider = ({ children, saveDraft: saveDraftHandler, submitForm }: Props) => {
  const { getLatestSubmission } = useSubmissionState();
  const [status, setStatus] = useState<PersistenceStatus>('idle');
  const [error, setError] = useState<unknown>();
  const saveLoopRef = useRef<Promise<boolean> | null>(null);
  const hasQueuedSaveRef = useRef(false);

  const saveDraft = useCallback(async () => {
    if (!saveDraftHandler) return false;

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

            await saveDraftHandler(latestSubmission);
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
  }, [getLatestSubmission, saveDraftHandler]);

  const submit = useCallback(async () => {
    if (!submitForm) return;

    if (saveLoopRef.current && !(await saveLoopRef.current)) {
      return;
    }

    const latestSubmission = getLatestSubmission();
    if (!latestSubmission) return;

    setStatus('submitting');
    setError(undefined);
    try {
      await submitForm(latestSubmission);
      setStatus('submitted');
    } catch (e) {
      setError(e);
      setStatus('idle');
    }
  }, [getLatestSubmission, submitForm]);

  const value = useMemo(
    () => ({
      saveDraft,
      submit,
      status,
      error,
      canSaveDraft: !!saveDraftHandler,
      canSubmit: !!submitForm,
    }),
    [saveDraft, submit, status, error, saveDraftHandler, submitForm],
  );

  return <FormPersistenceContext.Provider value={value}>{children}</FormPersistenceContext.Provider>;
};

const useFormPersistence = () => useContext(FormPersistenceContext);

export { FormPersistenceProvider, useFormPersistence };
export type { FormPersistenceContextType, FormPersistenceHandlers, PersistenceStatus };
