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
  saveDraft?: (submission: Submission) => Promise<Submission | void>;
  submitForm?: (submission: Submission) => Promise<void>;
}

interface FormPersistenceContextType {
  saveDraft: () => Promise<void>;
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
  const { getLatestSubmission, setSubmission } = useSubmissionState();
  const [status, setStatus] = useState<PersistenceStatus>('idle');
  const [error, setError] = useState<unknown>();
  const saveLoopRef = useRef<Promise<void> | null>(null);
  const hasQueuedSaveRef = useRef(false);

  const saveDraft = useCallback(async () => {
    if (!saveDraftHandler) return;

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
              return;
            }

            const persistedSubmission = await saveDraftHandler(latestSubmission);
            if (persistedSubmission) {
              setSubmission(persistedSubmission);
            }
          }
        } catch (e) {
          setError(e);
        } finally {
          saveLoopRef.current = null;
          setStatus('idle');
        }
      })();
    }

    await saveLoopRef.current;
  }, [getLatestSubmission, saveDraftHandler, setSubmission]);

  const submit = useCallback(async () => {
    if (!submitForm) return;

    await saveLoopRef.current;

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
