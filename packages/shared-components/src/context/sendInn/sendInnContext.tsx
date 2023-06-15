import { I18nTranslations, NavFormType, Submission } from "@navikt/skjemadigitalisering-shared-domain";
import React, { createContext, useContext, useMemo, useState } from "react";
import {
  SendInnSoknadResponse,
  createSoknad,
  createSoknadWithoutInnsendingsId,
  updateSoknad,
  updateUtfyltSoknad,
} from "../../api/sendInnSoknad";
import { useAppConfig } from "../../configContext";

interface SendInnContextType {
  startMellomlagring: (submission: Submission) => Promise<SendInnSoknadResponse | undefined>;
  updateMellomlagring: (submission: Submission) => Promise<SendInnSoknadResponse | undefined>;
  submitSoknad: (submission: Submission) => Promise<SendInnSoknadResponse | undefined>;
  innsendingsId: string | undefined;
}

interface SendInnProviderProps {
  children: React.ReactNode;
  form: NavFormType;
  translations: I18nTranslations;
}

const SendInnContext = createContext<SendInnContextType>({} as SendInnContextType);

const SendInnProvider = ({ children, form, translations }: SendInnProviderProps) => {
  const appConfig = useAppConfig();
  const [mellomlagringStarted, setMellomlagringStarted] = useState(false);
  const [innsendingsId, setInnsendingsId] = useState<string>();

  const isMellomLagringEnabled = useMemo(() => {
    const { app, submissionMethod, featureToggles } = appConfig;
    return app === "fyllut" && submissionMethod === "digital" && featureToggles?.enableMellomlagring;
  }, [appConfig]);

  const translationForLanguage = (language = "nb-NO") => {
    if (language !== "nb-NO" && Object.keys(translations).length > 0) {
      return translations[language] ?? {};
    }
    return {};
  };

  const getLanguageFromSearchParams = () => {
    return new URL(window.location.href).searchParams.get("lang") || "nb-NO";
  };

  const startMellomlagring = async (submission: Submission) => {
    if (appConfig.app === "bygger") {
      appConfig.logger?.error("Mellomlagring er ikke tilgjengelig i byggeren");
    }
    if (isMellomLagringEnabled && !mellomlagringStarted) {
      setMellomlagringStarted(true);
      const currentLanguage = getLanguageFromSearchParams();
      const translation = translationForLanguage(currentLanguage);
      const response = await createSoknad(appConfig, form, submission, currentLanguage, translation);
      setInnsendingsId(response?.innsendingsId);
      return response;
    }
  };

  const updateMellomlagring = async (submission: Submission): Promise<SendInnSoknadResponse | undefined> => {
    if (isMellomLagringEnabled) {
      const currentLanguage = getLanguageFromSearchParams();
      const translation = translationForLanguage(currentLanguage);
      return updateSoknad(appConfig, form, submission, currentLanguage, translation, innsendingsId);
    }
  };

  const submitSoknad = async (submission: Submission) => {
    const currentLanguage = getLanguageFromSearchParams();
    const translation = translationForLanguage(currentLanguage);
    if (isMellomLagringEnabled) {
      return updateUtfyltSoknad(appConfig, form, submission, currentLanguage, translation, innsendingsId);
    }
    return createSoknadWithoutInnsendingsId(appConfig, form, submission, currentLanguage, translation);
  };

  const value = {
    startMellomlagring,
    updateMellomlagring,
    submitSoknad,
    innsendingsId,
  };

  return <SendInnContext.Provider value={value}>{children}</SendInnContext.Provider>;
};

const useSendInn = () => useContext(SendInnContext);

export { SendInnProvider, useSendInn };
