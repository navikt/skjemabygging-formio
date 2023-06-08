import { Language, NavFormType, Submission } from "@navikt/skjemadigitalisering-shared-domain";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { updateMellomlagring } from "../../api/sendInnSoknad";
import { useAppConfig } from "../../configContext";

interface SendInnContextType {
  startSoknad: (submission, language) => Promise<any>;
  updateSoknad: (data: { submission: Submission; language: Language; innsendingsId?: string }) => void;
  //submitSoknad: () => {}
}

interface SendInnProviderProps {
  children: React.ReactNode;
  form: NavFormType;
}

//TODO: move
interface SendInnSoknadResponse {
  innsendingsId: string;
}

const SendInnContext = createContext<SendInnContextType>({} as SendInnContextType);

const SendInnProvider = ({ children, form }: SendInnProviderProps) => {
  const appConfig = useAppConfig();
  const { submissionMethod, baseUrl, http, config } = appConfig;
  const [soknadState, setSoknadState] = useState<{ started: boolean; innsendingsId?: string; someValue?: string }>({
    started: false,
  });
  const [mellomLagringsQueue, setMellomLagringsQueue] = useState<Array<{ submission: Submission; language: Language }>>(
    []
  );

  useEffect(() => {
    if (mellomLagringsQueue.length >= 1) {
      console.log(`Køen har ${mellomLagringsQueue.length} oppdatering(er). Kun den nyeste blir sendt`);
      console.log(mellomLagringsQueue);
      const { submission, language } = mellomLagringsQueue[0];
      setMellomLagringsQueue([]);
      updateMellomlagring(appConfig, form, submission, language, soknadState.innsendingsId);
    }
  }, [appConfig, form, mellomLagringsQueue, soknadState.innsendingsId]);
  // const [soknadStarted, setSoknadStarted] = useState(false);
  // const [innsendingsId, setInnsendingsId] = useState<string>();

  console.log("soknadState", soknadState);

  //TODO: submission is initially undefined
  const startSoknad = useCallback(
    async (submission: Submission, currentLanguage: Language = "nb-NO") => {
      // console.log("soknadStarted", soknadState.started);
      if (http && !soknadState.started) {
        // console.log("http && !soknadStarted", http && !soknadState.started);
        setSoknadState((prevState) => ({ ...prevState, started: true, someValue: "1234" }));
        const response = await http.post<SendInnSoknadResponse>(
          `${baseUrl}/api/send-inn/soknad`,
          {
            form,
            submission,
            language: currentLanguage,
            submissionMethod,
          },
          {
            "Fyllut-Is-Test": `${config?.isTest}`,
          },
          { redirectToLocation: false }
        );
        // console.log(response);
        console.log("response", response);
        setSoknadState({ started: true, innsendingsId: response.innsendingsId });
        // setSoknadState((prevState) => ({
        //   ...prevState,
        //   innsendingsId: response.innsendingsId,
        // }));
        return response;
      }
    },
    [baseUrl, config?.isTest, form, http, soknadState.started, submissionMethod]
  );

  const updateSoknad = (soknadData: { submission: Submission; language: Language }) => {
    console.log("UpdateSoknad innsendingsId");
    setMellomLagringsQueue((prevState) => [soknadData, ...prevState]);
  };

  const value = {
    soknadState,
    startSoknad,
    updateSoknad,
  };

  // const startSoknadWithoutMellomlagring = () => setSoknadStarted(true);

  // const value = featureToggles.enableMellomlagring ? {
  //   startSoknad,
  //   updateSoknad,
  // } : {
  //   startSoknad: startSoknadWithoutMellomlagring,
  //   updateSoknad: () => {}
  // };

  return <SendInnContext.Provider value={value}>{children}</SendInnContext.Provider>;
};

const useSendInnContext = () => useContext(SendInnContext);

export { SendInnProvider, useSendInnContext };
