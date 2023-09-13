import { I18nTranslations, Language, NavFormType, Submission, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  SendInnSoknadResponse,
  createSoknad,
  createSoknadWithoutInnsendingsId,
  deleteSoknad,
  getSoknad,
  updateSoknad,
  updateUtfyltSoknad,
} from "../../api/sendInnSoknad";
import { useAppConfig } from "../../configContext";
import { useLanguages } from "../languages";

interface SendInnContextType {
  startMellomlagring: (submission: Submission) => Promise<SendInnSoknadResponse | undefined>;
  updateMellomlagring: (submission: Submission) => Promise<SendInnSoknadResponse | undefined>;
  submitSoknad: (submission: Submission) => Promise<SendInnSoknadResponse | undefined>;
  deleteMellomlagring: () => Promise<{ status: string; info: string } | undefined>;
  isMellomlagringActive: boolean;
  isMellomlagringEnabled: boolean;
  isMellomlagringReady: boolean;
  innsendingsId?: string;
  mellomlagringError: MellomlagringError | undefined;
}

interface SendInnProviderProps {
  children: React.ReactNode;
  form: NavFormType;
  translations: I18nTranslations;
  updateSubmission: (submission?: Submission) => void;
}

type MellomlagringErrorType = "START" | "GET" | "NOT FOUND" | "UPDATE" | "SUBMIT" | "DELETE";
type MellomlagringError = { title: string; message: string; type: MellomlagringErrorType };

const SendInnContext = createContext<SendInnContextType>({} as SendInnContextType);

const SendInnProvider = ({ children, form, translations, updateSubmission }: SendInnProviderProps) => {
  const [mellomlagringStarted, setMellomlagringStarted] = useState(false);
  const [innsendingsId, setInnsendingsId] = useState<string>();
  const [mellomlagringError, setMellomlagringError] = useState<MellomlagringError>();
  const { translate } = useLanguages();
  const appConfig = useAppConfig();
  const { app, submissionMethod, featureToggles, logger } = appConfig;
  const isMellomlagringEnabled =
    app === "fyllut" && submissionMethod === "digital" && !!featureToggles?.enableMellomlagring;
  const [isMellomlagringReady, setIsMellomlagringReady] = useState(!isMellomlagringEnabled);
  const { search } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isMellomlagringActive = useMemo(
    () => isMellomlagringEnabled && !!searchParams.get("innsendingsId"),
    [isMellomlagringEnabled, search],
  );
  const addQueryParamToUrl = useCallback((key, value) => {
    if (key && value) {
      searchParams.set(key, value);
      setSearchParams(searchParams);
    }
  }, []);

  useEffect(() => {
    const retrievePreviousSubmission = async () => {
      try {
        const searchParams = new URLSearchParams(search);
        const innsendingsId = searchParams.get("innsendingsId");
        if (!mellomlagringStarted && innsendingsId) {
          setInnsendingsId(innsendingsId);
          setMellomlagringStarted(true);
          const response = await getSoknad(innsendingsId, appConfig);
          if (response?.hoveddokumentVariant.document) {
            addQueryParamToUrl("lang", response.hoveddokumentVariant.document.language);
            updateSubmission(response.hoveddokumentVariant.document?.data);
          }
        }
      } catch (error: any) {
        const getError: MellomlagringError =
          error.status === 404
            ? {
                type: "NOT FOUND",
                message: translate(TEXTS.statiske.mellomlagringError.get.notFoundMessage),
                title: "",
              }
            : {
                type: "GET",
                title: translate(TEXTS.statiske.mellomlagringError.get.title),
                message: translate(TEXTS.statiske.mellomlagringError.get.message),
              };
        setMellomlagringError(getError);
      } finally {
        setIsMellomlagringReady(true);
      }
    };
    if (isMellomlagringActive) {
      retrievePreviousSubmission();
    }
  }, [addQueryParamToUrl, appConfig, isMellomlagringActive, mellomlagringStarted, search, translate, updateSubmission]);

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
    if (isMellomlagringEnabled && !mellomlagringStarted) {
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
      }
    }
  };

  const updateMellomlagring = async (submission: Submission): Promise<SendInnSoknadResponse | undefined> => {
    if (isMellomlagringEnabled) {
      try {
        const currentLanguage = getLanguageFromSearchParams();
        const translation = translationForLanguage(currentLanguage);
        return updateSoknad(appConfig, form, submission, currentLanguage, translation, innsendingsId);
      } catch (error: any) {
        setMellomlagringError({
          type: "UPDATE",
          title: translate(TEXTS.statiske.mellomlagringError.update.title),
          message: translate(TEXTS.statiske.mellomlagringError.update.message),
        });
        logger?.info("Oppdatering av mellomlagring feilet", error);
      }
    }
  };

  const deleteMellomlagring = async (): Promise<{ status: string; info: string } | undefined> => {
    if (isMellomlagringEnabled && innsendingsId) {
      try {
        return await deleteSoknad(appConfig, innsendingsId);
      } catch (error: any) {
        setMellomlagringError({
          type: "DELETE",
          title: translate(TEXTS.statiske.mellomlagringError.delete.title),
          message: translate(TEXTS.statiske.mellomlagringError.delete.message),
        });
        logger?.info("Sletting av mellomlagring feilet", error);
      }
    }
  };

  const submitSoknad = async (submission: Submission) => {
    const currentLanguage = getLanguageFromSearchParams();
    const translation = translationForLanguage(currentLanguage);
    if (isMellomlagringEnabled && innsendingsId) {
      try {
        return await updateUtfyltSoknad(appConfig, form, submission, currentLanguage, translation, innsendingsId);
      } catch (error: any) {
        try {
          await updateSoknad(appConfig, form, submission, currentLanguage, translation, innsendingsId);
          setMellomlagringError({
            type: "SUBMIT",
            title: translate(TEXTS.statiske.mellomlagringError.submit.title),
            message: `${translate(TEXTS.statiske.mellomlagringError.submit.savedDraftMessage)} ${translate(
              TEXTS.statiske.mellomlagringError.submit.tryLaterMessage,
            )}`,
          });
        } catch (error) {
          setMellomlagringError({
            type: "SUBMIT",
            title: translate(TEXTS.statiske.mellomlagringError.submit.title),
            message: translate(TEXTS.statiske.mellomlagringError.submit.tryLaterMessage),
          });
        }
      }
    } else {
      return await createSoknadWithoutInnsendingsId(appConfig, form, submission, currentLanguage, translation);
    }
  };

  const value: SendInnContextType = {
    startMellomlagring,
    updateMellomlagring,
    deleteMellomlagring,
    submitSoknad,
    innsendingsId,
    isMellomlagringActive,
    isMellomlagringEnabled,
    isMellomlagringReady,
    mellomlagringError,
  };

  return <SendInnContext.Provider value={value}>{children}</SendInnContext.Provider>;
};

const useSendInn = () => useContext(SendInnContext);

export { SendInnProvider, useSendInn };
