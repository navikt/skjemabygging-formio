import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import useFormsApi from '../../hooks/useFormsApi';

interface RecipientsContextValues {
  isReady: boolean;
  recipients: Recipient[];
  newRecipient?: Partial<Recipient>;
  addNewRecipient: () => void;
  saveRecipient: (recipient: Recipient) => Promise<Recipient | undefined>;
}

const defaultContextValue = {
  isReady: false,
  recipients: [],
  addNewRecipient: () => {},
  saveRecipient: (_recipient) => Promise.reject(),
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

  const saveRecipient = async (changedRecipient: Recipient) => {
    if (changedRecipient.recipientId === 'new') {
      const { recipientId, ...newRecipient } = changedRecipient;
      const recipient = await recipientsApi.post(newRecipient);
      console.log('Result', recipient);
      if (recipient) {
        setRecipientState((state) => ({ ...state, recipients: [...state.recipients, recipient], new: undefined }));
      }
      return recipient;
    }

    const recipient = await recipientsApi.put(changedRecipient);
    if (recipient) {
      setRecipientState((state) => {
        const indexOfExisting = state.recipients.findIndex(
          (existing) => existing.recipientId === recipient.recipientId,
        );
        const newRecipients = [...state.recipients];
        newRecipients[indexOfExisting] = recipient;
        return { ...state, recipients: newRecipients };
      });
    }
    return recipient;
  };

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
    saveRecipient,
  };
  return <RecipientsContext.Provider value={value}>{children}</RecipientsContext.Provider>;
};

export const useRecipients = () => useContext(RecipientsContext);
export default RecipientsProvider;
