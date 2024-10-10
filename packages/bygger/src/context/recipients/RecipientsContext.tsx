import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import useFormsApi from '../../hooks/useFormsApi';

interface RecipientsContextValues {
  isReady: boolean;
  recipients: Recipient[];
  newRecipient?: Partial<Recipient>;
  addNewRecipient: () => void;
}

const defaultContextValue = {
  isReady: false,
  recipients: [],
  addNewRecipient: () => {},
};

interface RecipientState {
  isReady: boolean;
  recipients: Recipient[];
  new?: Partial<Recipient>;
}

const RecipientsContext = createContext<RecipientsContextValues>(defaultContextValue);

const RecipientsProvider = ({ children }: { children: ReactNode }) => {
  const { recipientsApi } = useFormsApi();
  const [recipientState, setRecipientState] = useState<RecipientState>({ isReady: false, recipients: [] });

  const loadRecipients = useCallback(async (): Promise<void> => {
    const recipients = await recipientsApi.getAll();
    setRecipientState((state) => ({ ...state, recipients: recipients ?? [] }));
  }, [recipientsApi]);

  useEffect(() => {
    if (!recipientState.isReady) {
      loadRecipients().then(() => setRecipientState((state) => ({ ...state, isReady: true })));
    }
  }, [recipientState.isReady, loadRecipients]);

  const addNewRecipient = () => {
    if (recipientState.new === undefined) {
      setRecipientState((state) => ({ ...state, new: { recipientId: 'new' } }));
    }
  };

  const value = {
    isReady: recipientState.isReady,
    recipients: recipientState.recipients,
    newRecipient: recipientState.new,
    addNewRecipient,
  };
  return <RecipientsContext.Provider value={value}>{children}</RecipientsContext.Provider>;
};

export const useRecipients = () => useContext(RecipientsContext);
export default RecipientsProvider;
