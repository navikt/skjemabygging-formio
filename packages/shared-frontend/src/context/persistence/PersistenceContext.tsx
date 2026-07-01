import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { useSubmission } from '../submission/SubmissionContext';

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
  const { submission } = useSubmission();
  const [status, setStatus] = useState<PersistenceStatus>('idle');
  const [error, setError] = useState<unknown>();

  const saveDraft = useCallback(async () => {
    if (!saveDraftHandler || !submission) return;
    setStatus('saving');
    setError(undefined);
    try {
      await saveDraftHandler(submission);
      setStatus('idle');
    } catch (e) {
      setError(e);
      setStatus('idle');
    }
  }, [saveDraftHandler, submission]);

  const submit = useCallback(async () => {
    if (!submitForm || !submission) return;
    setStatus('submitting');
    setError(undefined);
    try {
      await submitForm(submission);
      setStatus('submitted');
    } catch (e) {
      setError(e);
      setStatus('idle');
    }
  }, [submitForm, submission]);

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
