import { I18nTranslations, Language, NavFormType, Submission } from "@navikt/skjemadigitalisering-shared-domain";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  SendInnSoknadResponse,
  createSoknad,
  createSoknadWithoutInnsendingsId,
  deleteSoknad,
  getSoknad,
  updateSoknad,
  updateUtfyltSoknad,
} from "../../api/sendInnSoknad";
import { HttpError } from "../../components/error";
import { useAppConfig } from "../../configContext";

interface SendInnContextType {
  startMellomlagring: (submission: Submission) => Promise<SendInnSoknadResponse | undefined>;
  updateMellomlagring: (submission: Submission) => Promise<SendInnSoknadResponse | undefined>;
  submitSoknad: (submission: Submission) => Promise<SendInnSoknadResponse | undefined>;
  deleteMellomlagring: () => Promise<{ status: string; info: string } | undefined>;
  innsendingsId: string | undefined;
  mellomlagringError: HttpError | Error | undefined;
}

interface SendInnProviderProps {
  children: React.ReactNode;
  form: NavFormType;
  translations: I18nTranslations;
  updateSubmission: (submission?: Submission) => void;
}

const SendInnContext = createContext<SendInnContextType>({} as SendInnContextType);

const SendInnProvider = ({ children, form, translations, updateSubmission }: SendInnProviderProps) => {
  const [mellomlagringStarted, setMellomlagringStarted] = useState(false);
  const [innsendingsId, setInnsendingsId] = useState<string>();
  const [mellomlagringError, setMellomlagringError] = useState<Error>();

  const appConfig = useAppConfig();
  const { app, submissionMethod, featureToggles, logger } = appConfig;
  const isMellomLagringEnabled =
    app === "fyllut" && submissionMethod === "digital" && featureToggles?.enableMellomlagring;
  const [isMellomlagringReady, setIsMellomlagringReady] = useState(!isMellomLagringEnabled);
  const history = useHistory();
  const { search } = useLocation();

  const addQueryParamToUrl = useCallback(
    (key, value) => {
      if (key && value) {
        const searchParams = new URLSearchParams(history.location.search);
        searchParams.set(key, value);
        history.push({ search: searchParams.toString() });
      }
    },
    [history]
  );

  useEffect(() => {
    const retrievePreviousSubmission = async () => {
      try {
        const searchParams = new URLSearchParams(search);
        const innsendingsId = searchParams.get("innsendingsId");
        if (!mellomlagringStarted && innsendingsId && appConfig.submissionMethod === "digital") {
          setInnsendingsId(innsendingsId);
          setMellomlagringStarted(true);
          const response = await getSoknad(innsendingsId, appConfig);
          if (response?.hoveddokumentVariant.document) {
            addQueryParamToUrl("lang", response.hoveddokumentVariant.document.language);
            updateSubmission(response.hoveddokumentVariant.document?.data);
          }
          setIsMellomlagringReady(true);
        }
      } catch (error: any) {
        setMellomlagringError(error as Error);
      }
    };
    retrievePreviousSubmission();
  }, [addQueryParamToUrl, appConfig, mellomlagringStarted, search, updateSubmission]);

  const nbNO: Language = "nb-NO";

  const translationForLanguage = (language: Language = nbNO) => {
    if (language !== nbNO && Object.keys(translations).length > 0) {
      return translations[language] ?? {};
    }
    return {};
  };

  const getLanguageFromSearchParams = (): Language => {
    return (new URL(window.location.href).searchParams.get("lang") as Language) || nbNO;
  };

  const startMellomlagring = async (submission: Submission) => {
    if (isMellomLagringEnabled && !mellomlagringStarted) {
      try {
        setMellomlagringStarted(true);
        const currentLanguage = getLanguageFromSearchParams();
        const translation = translationForLanguage(currentLanguage);
        const response = await createSoknad(appConfig, form, submission, currentLanguage, translation);
        setInnsendingsId(response?.innsendingsId);
        addQueryParamToUrl("innsendingsId", response?.innsendingsId);
        setIsMellomlagringReady(true);
        return response;
      } catch (error: any) {
        logger?.info("Oppretting av mellomlagring feilet", error);
        setIsMellomlagringReady(true);
        // Sak for å kommunisere feil til bruker: https://trello.com/c/3y65psdc
      }
    }
  };

  const updateMellomlagring = async (submission: Submission): Promise<SendInnSoknadResponse | undefined> => {
    if (isMellomLagringEnabled) {
      try {
        const currentLanguage = getLanguageFromSearchParams();
        const translation = translationForLanguage(currentLanguage);
        return await updateSoknad(appConfig, form, submission, currentLanguage, translation, innsendingsId);
      } catch (error: any) {
        logger?.info("Oppdatering av mellomlagring feilet", error);
        // Sak for å kommunisere feil til bruker: https://trello.com/c/3y65psdc
      }
    }
  };

  const deleteMellomlagring = async (): Promise<{ status: string; info: string } | undefined> => {
    if (isMellomLagringEnabled && innsendingsId) {
      try {
        return await deleteSoknad(appConfig, innsendingsId);
      } catch (error: any) {
        logger?.info("Sletting av mellomlagring feilet", error);
      }
    }
  };

  const submitSoknad = async (submission: Submission) => {
    const currentLanguage = getLanguageFromSearchParams();
    const translation = translationForLanguage(currentLanguage);
    if (isMellomLagringEnabled && innsendingsId) {
      return await updateUtfyltSoknad(appConfig, form, submission, currentLanguage, translation, innsendingsId);
    }
    return await createSoknadWithoutInnsendingsId(appConfig, form, submission, currentLanguage, translation);
  };

  const value = {
    startMellomlagring,
    updateMellomlagring,
    deleteMellomlagring,
    submitSoknad,
    innsendingsId,
    isMellomlagringReady,
    mellomlagringError,
  };

  return <SendInnContext.Provider value={value}>{children}</SendInnContext.Provider>;
};

const useSendInn = () => useContext(SendInnContext);

export { SendInnProvider, useSendInn };
