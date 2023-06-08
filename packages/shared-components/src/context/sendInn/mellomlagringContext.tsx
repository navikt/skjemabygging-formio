import { NavFormType, Submission } from "@navikt/skjemadigitalisering-shared-domain";
import React, { createContext, useCallback, useContext, useState } from "react";
import { SendInnSoknadResponse, createSendInnSoknad, updateSendInnSoknad } from "../../api/sendInnSoknad";
import { useAppConfig } from "../../configContext";

interface MellomlagringContextType {
  startMellomlagring: (submission: Submission, language: string) => Promise<SendInnSoknadResponse | undefined>;
  updateMellomlagring: (submission: Submission, language: string) => Promise<SendInnSoknadResponse | undefined>;
  //submitSoknad: () => {}
}

interface MellomlagringProviderProps {
  children: React.ReactNode;
  form: NavFormType;
}

const MellomlagringContext = createContext<MellomlagringContextType>({} as MellomlagringContextType);

const MellomlagringProvider = ({ children, form }: MellomlagringProviderProps) => {
  const appConfig = useAppConfig();
  const [mellomlagringStarted, setMellomlagringStarted] = useState(false);
  const [innsendingsId, setInnsendingsId] = useState<string>();

  //TODO: submission is initially undefined
  const startMellomlagring = useCallback(
    async (submission: Submission, currentLanguage: string = "nb-NO") => {
      if (!mellomlagringStarted) {
        setMellomlagringStarted(true);
        const response = await createSendInnSoknad(appConfig, form, submission, currentLanguage);
        setInnsendingsId(response?.innsendingsId);
        return response;
      }
    },
    [appConfig, form, mellomlagringStarted]
  );

  const updateMellomlagring = async (
    submission: Submission,
    language: string
  ): Promise<SendInnSoknadResponse | undefined> => {
    return updateSendInnSoknad(appConfig, form, submission, language, innsendingsId);
  };

  const value = {
    startMellomlagring,
    updateMellomlagring,
  };

  return <MellomlagringContext.Provider value={value}>{children}</MellomlagringContext.Provider>;
};

const useMellomlagring = () => useContext(MellomlagringContext);

export { MellomlagringProvider, useMellomlagring };
