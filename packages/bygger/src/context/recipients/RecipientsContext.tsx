import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import useFormsApiRecipients from '../../api/useFormsApiRecipients';

interface RecipientsContextValues {
  isReady: boolean;
  recipients: Recipient[];
  newRecipient?: Partial<Recipient>;
  addNewRecipient: () => void;
  cancelNewRecipient: () => void;
  saveRecipient: (recipient: Recipient) => Promise<Recipient | undefined>;
  deleteRecipient: (recipientId?: string) => Promise<void>;
}

const defaultContextValue = {
  isReady: false,
  recipients: [],
  addNewRecipient: () => {},
  cancelNewRecipient: () => {},
  saveRecipient: (_recipient) => Promise.reject(),
  deleteRecipient: (_recipientId) => Promise.reject(),
};

interface RecipientState {
  isReady: boolean;
  recipients: Recipient[];
  new?: Partial<Recipient>;
}

const RecipientsContext = createContext<RecipientsContextValues>(defaultContextValue);

const RecipientsProvider = ({ children }: { children: ReactNode }) => {
  const recipientsApi = useFormsApiRecipients();
  const [recipientState, setRecipientState] = useState<RecipientState>({ isReady: false, recipients: [] });

  const loadRecipients = useCallback(async (): Promise<void> => {
    const recipients = await recipientsApi.getAll();
    setRecipientState((state) => ({ ...state, recipients: recipients ?? [] }));
  }, [recipientsApi]);

  useEffect(() => {
    if (!recipientState.isReady) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadRecipients().then(() => setRecipientState((state) => ({ ...state, isReady: true })));
    }
  }, [recipientState.isReady, loadRecipients]);

  const saveRecipient = async (changedRecipient: Recipient) => {
    const result = await recipientsApi.save(changedRecipient);
    if (result) {
      setRecipientState((state) => ({ ...state, new: undefined }));
      await loadRecipients();
    }
    return result;
  };

  const deleteRecipient = async (recipientId?: string) => {
    if (recipientId) {
      await recipientsApi.deleteRecipient(recipientId);
      await loadRecipients();
    }
  };

  const addNewRecipient = () => {
    if (recipientState.new === undefined) {
      setRecipientState((state) => ({ ...state, new: {} }));
    }
  };

  const cancelNewRecipient = () => {
    setRecipientState((state) => ({ ...state, new: undefined }));
  };

  const value = {
    isReady: recipientState.isReady,
    recipients: recipientState.recipients,
    newRecipient: recipientState.new,
    addNewRecipient,
    cancelNewRecipient,
    saveRecipient,
    deleteRecipient,
  };
  return <RecipientsContext.Provider value={value}>{children}</RecipientsContext.Provider>;
};

export const useRecipients = () => useContext(RecipientsContext);
export default RecipientsProvider;
