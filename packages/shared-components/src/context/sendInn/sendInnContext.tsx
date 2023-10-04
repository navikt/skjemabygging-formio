import {
  I18nTranslations,
  Language,
  NavFormType,
  Submission,
  FyllutState,
  MellomlagringError,
} from "@navikt/skjemadigitalisering-shared-domain";
import React, { createContext, useCallback, useContext, useEffect, useReducer, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  createSoknad,
  createSoknadWithoutInnsendingsId,
  deleteSoknad,
  getSoknad,
  SendInnSoknadResponse,
  updateSoknad,
  updateUtfyltSoknad,
} from "../../api/sendInnSoknad";
import { useAppConfig } from "../../configContext";
import { useLanguages } from "../languages";
import { getSubmissionWithFyllutState, removeFyllutState } from "./utils";
import { mellomlagringReducer } from "./mellomlagringReducer";

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
  onFyllutStateChange: (fyllutState: Partial<FyllutState>) => void;
}

const SendInnContext = createContext<SendInnContextType>({} as SendInnContextType);

const SendInnProvider = ({
  children,
  form,
  translations,
  updateSubmission,
  onFyllutStateChange,
}: SendInnProviderProps) => {
  const { translate } = useLanguages();
  const appConfig = useAppConfig();
  const { app, submissionMethod, featureToggles, logger } = appConfig;
  const { pathname, search } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isMellomlagringEnabled =
    app === "fyllut" && submissionMethod === "digital" && !!featureToggles?.enableMellomlagring;
  // Is initialized if it has attempted to fetch mellomlagring or if mellomlagring is not enabled
  const [isInitialized, setIsInitialized] = useState(!isMellomlagringEnabled);
  // Make sure that we only fetch or create mellomlagring once
  const [isFetchOrCreateStarted, setIsFetchOrCreateStarted] = useState(false);
  const [innsendingsId, setInnsendingsId] = useState<string>();
  const [fyllutMellomlagringState, dispatchFyllutMellomlagring] = useReducer(mellomlagringReducer, undefined);

  const addQueryParamToUrl = useCallback(
    (key, value) => {
      if (key && value) {
        searchParams.set(key, value);
        setSearchParams(searchParams);
      }
    },
    [pathname],
  );

  useEffect(() => {
    if (fyllutMellomlagringState) {
      onFyllutStateChange({ mellomlagring: fyllutMellomlagringState });
    }
  }, [fyllutMellomlagringState]);

  const retrieveMellomlagring = async (innsendingsId: string) => {
    setIsFetchOrCreateStarted(true);
    const response = await getSoknad(innsendingsId, appConfig);
    if (response?.hoveddokumentVariant.document) {
      addQueryParamToUrl("lang", response.hoveddokumentVariant.document.language);
      updateSubmission(getSubmissionWithFyllutState(response));
      dispatchFyllutMellomlagring({ type: "init", response });
    }
  };

  useEffect(() => {
    const initializeMellomlagring = async () => {
      try {
        const innsendingsId = searchParams.get("innsendingsId");
        if (!isFetchOrCreateStarted && innsendingsId) {
          setInnsendingsId(innsendingsId);
          await retrieveMellomlagring(innsendingsId);
        }
      } catch (error: any) {
        dispatchFyllutMellomlagring({ type: "error", error: error.status === 404 ? "NOT FOUND" : "GET FAILED" });
      } finally {
        setIsInitialized(true);
      }
    };
    if (!isInitialized) {
      initializeMellomlagring();
    }
  }, [isMellomlagringEnabled, isFetchOrCreateStarted, search, translate, retrieveMellomlagring]);

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
    if (!isMellomlagringEnabled || !isInitialized || isFetchOrCreateStarted) {
      return;
    }

    try {
      setIsFetchOrCreateStarted(true);
      const currentLanguage = getLanguageFromSearchParams();
      const translation = translationForLanguage(currentLanguage);
      const response = await createSoknad(appConfig, form, removeFyllutState(submission), currentLanguage, translation);
      updateSubmission(getSubmissionWithFyllutState(response));
      dispatchFyllutMellomlagring({ type: "init", response });
      setInnsendingsId(response?.innsendingsId);
      addQueryParamToUrl("innsendingsId", response?.innsendingsId);
      return response;
    } catch (error: any) {
      logger?.info("Oppretting av mellomlagring feilet", error);
    }
  };

  const updateMellomlagring = async (submission: Submission): Promise<SendInnSoknadResponse | undefined> => {
    if (!(isMellomlagringEnabled && isInitialized)) {
      return;
    }

    try {
      const currentLanguage = getLanguageFromSearchParams();
      const translation = translationForLanguage(currentLanguage);
      const response = await updateSoknad(
        appConfig,
        form,
        removeFyllutState(submission),
        currentLanguage,
        translation,
        innsendingsId,
      );
      dispatchFyllutMellomlagring({ type: "update", response });
      return response;
    } catch (error: any) {
      dispatchFyllutMellomlagring({ type: "error", error: "UPDATE FAILED" });
      logger?.info("Oppdatering av mellomlagring feilet", error);
    }
  };

  const deleteMellomlagring = async (): Promise<{ status: string; info: string } | undefined> => {
    if (!(isMellomlagringEnabled && isInitialized && innsendingsId)) {
      return;
    }

    try {
      return await deleteSoknad(appConfig, innsendingsId);
    } catch (error: any) {
      dispatchFyllutMellomlagring({ type: "error", error: "DELETE FAILED" });
      logger?.info("Sletting av mellomlagring feilet", error);
    }
  };

  const submitSoknad = async (appSubmission: Submission) => {
    if (!isInitialized) {
      return;
    }

    const currentLanguage = getLanguageFromSearchParams();
    const translation = translationForLanguage(currentLanguage);
    const submission = removeFyllutState(appSubmission);
    if (isMellomlagringEnabled && innsendingsId) {
      try {
        return await updateUtfyltSoknad(appConfig, form, submission, currentLanguage, translation, innsendingsId);
      } catch (error: any) {
        try {
          await updateSoknad(appConfig, form, submission, currentLanguage, translation, innsendingsId);
          dispatchFyllutMellomlagring({ type: "error", error: "SUBMIT FAILED" });
        } catch (error) {
          dispatchFyllutMellomlagring({ type: "error", error: "SUBMIT AND UPDATE FAILED" });
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
    isMellomlagringEnabled,
    isMellomlagringActive: !!fyllutMellomlagringState?.isActive,
    isMellomlagringReady: isInitialized,
    mellomlagringError: fyllutMellomlagringState?.error,
  };

  return <SendInnContext.Provider value={value}>{children}</SendInnContext.Provider>;
};

const useSendInn = () => useContext(SendInnContext);

export { SendInnProvider, useSendInn };
