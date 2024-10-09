import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import useFormsApi from '../../hooks/useFormsApi';

interface RecipientsContextValues {
  isReady: boolean;
  recipients: Recipient[];
}

const defaultValue = {
  isReady: false,
  recipients: [],
};

const RecipientsContext = createContext<RecipientsContextValues>(defaultValue);

const RecipientsProvider = ({ children }: { children: ReactNode }) => {
  const { recipientsApi } = useFormsApi();
  const [isReady, setIsReady] = useState(defaultValue.isReady);
  const [recipients, setRecipients] = useState<Recipient[]>(defaultValue.recipients);

  const loadRecipients = useCallback(async (): Promise<void> => {
    const recipients = await recipientsApi.getAll();
    setRecipients(recipients ?? []);
  }, [recipientsApi]);

  useEffect(() => {
    if (!isReady) {
      loadRecipients().then(() => setIsReady(true));
    }
  }, [isReady, loadRecipients]);

  const value = {
    isReady,
    recipients,
  };
  return <RecipientsContext.Provider value={value}>{children}</RecipientsContext.Provider>;
};

export const useRecipients = () => useContext(RecipientsContext);
export default RecipientsProvider;
