import { I18nTranslations, NavFormType, Submission } from "@navikt/skjemadigitalisering-shared-domain";
import React, { createContext, useCallback, useContext, useState } from "react";
import {
  SendInnSoknadResponse,
  createSendInnSoknad,
  updateSendInnSoknad,
  updateUtfyltSoknad,
} from "../../api/sendInnSoknad";
import { useAppConfig } from "../../configContext";

interface MellomlagringContextType {
  startMellomlagring: (submission: Submission, language: string) => Promise<SendInnSoknadResponse | undefined>;
  updateMellomlagring: (submission: Submission, language: string) => Promise<SendInnSoknadResponse | undefined>;
  submitSoknad: (submission: Submission, language: string) => Promise<SendInnSoknadResponse | undefined>;
}

interface MellomlagringProviderProps {
  children: React.ReactNode;
  form: NavFormType;
  translations: I18nTranslations;
}

const MellomlagringContext = createContext<MellomlagringContextType>({} as MellomlagringContextType);

const MellomlagringProvider = ({ children, form, translations }: MellomlagringProviderProps) => {
  const appConfig = useAppConfig();
  const [mellomlagringStarted, setMellomlagringStarted] = useState(false);
  const [innsendingsId, setInnsendingsId] = useState<string>();

  const translationForLanguage = (language) => {
    if (language !== "nb-NO" && Object.keys(translations).length > 0) {
      return translations[language] ?? {};
    }
    return {};
  };
  console.log("translations", translations);
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

  const submitSoknad = async (submission, language) => {
    return updateUtfyltSoknad(appConfig, form, submission, language, translationForLanguage(language), innsendingsId);
  };

  const value = {
    startMellomlagring,
    updateMellomlagring,
    submitSoknad,
  };

  return <MellomlagringContext.Provider value={value}>{children}</MellomlagringContext.Provider>;
};

const useMellomlagring = () => useContext(MellomlagringContext);

export { MellomlagringProvider, useMellomlagring };
