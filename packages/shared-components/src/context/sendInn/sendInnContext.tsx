import { NavFormType, Submission } from "@navikt/skjemadigitalisering-shared-domain";
import { createContext, useCallback, useContext, useState } from "react";
import { SendInnSoknadResponse, createSendInnSoknad, updateSendInnSoknad } from "../../api/sendInnSoknad";
import { useAppConfig } from "../../configContext";

interface SendInnContextType {
  startSoknad: (submission: Submission, language: string) => Promise<SendInnSoknadResponse | undefined>;
  updateSoknad: (submission: Submission, language: string) => Promise<SendInnSoknadResponse | undefined>;
  //submitSoknad: () => {}
}

interface SendInnProviderProps {
  children: React.ReactNode;
  form: NavFormType;
}

const SendInnContext = createContext<SendInnContextType>({} as SendInnContextType);

const SendInnProvider = ({ children, form }: SendInnProviderProps) => {
  const appConfig = useAppConfig();
  const [soknadStarted, setSoknadStarted] = useState(false);
  const [innsendingsId, setInnsendingsId] = useState<string>();

  //TODO: submission is initially undefined
  const startSoknad = useCallback(
    async (submission: Submission, currentLanguage: string = "nb-NO") => {
      if (!soknadStarted) {
        setSoknadStarted(true);
        const response = await createSendInnSoknad(appConfig, form, submission, currentLanguage);
        setInnsendingsId(response?.innsendingsId);
        return response;
      }
    },
    [appConfig, form, soknadStarted]
  );

  const updateSoknad = async (submission: Submission, language: string): Promise<SendInnSoknadResponse | undefined> => {
    return updateSendInnSoknad(appConfig, form, submission, language, innsendingsId);
  };

  const value = {
    startSoknad,
    updateSoknad,
  };

  return <SendInnContext.Provider value={value}>{children}</SendInnContext.Provider>;
};

const useSendInnContext = () => useContext(SendInnContext);

export { SendInnProvider, useSendInnContext };
