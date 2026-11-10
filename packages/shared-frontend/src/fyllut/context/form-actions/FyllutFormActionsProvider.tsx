import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import { FormActionsProvider } from './FormActionsContext';
import { useDraftPersistence } from './useDraftPersistence';
import { useFormSubmission } from './useFormSubmission';

interface Props {
  children: ReactNode;
  form: Form;
  initialInnsendingsId?: string;
  setReceiptPdf: (pdf: Blob) => void;
}

const FyllutFormActionsProvider = ({ children, form, initialInnsendingsId, setReceiptPdf }: Props) => {
  const { ensureInnsendingsId, saveDraft } = useDraftPersistence(form, initialInnsendingsId);
  const submit = useFormSubmission(form, ensureInnsendingsId, setReceiptPdf);

  return (
    <FormActionsProvider save={saveDraft} submit={submit}>
      {children}
    </FormActionsProvider>
  );
};

export default FyllutFormActionsProvider;
