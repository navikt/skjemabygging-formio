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
  const appConfig = useAppConfig();
  const { app, submissionMethod, featureToggles, logger } = appConfig;
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isMellomlagringEnabled =
    app === "fyllut" && submissionMethod === "digital" && !!featureToggles?.enableMellomlagring;
  // isMellomlagringReady is true if we either have successfully fetched or created mellomlagring, or if mellomlagring is not enabled
  const [isMellomlagringReady, setIsMellomlagringReady] = useState(!isMellomlagringEnabled);
  // isInitialized is true if it has attempted to fetch mellomlagring
  const [isInitialized, setIsInitialized] = useState(false);
  // Make sure that we only create once
  const [isCreateStarted, setIsCreateStarted] = useState(false);
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
        if (innsendingsId) {
          setInnsendingsId(innsendingsId);
          await retrieveMellomlagring(innsendingsId);
          setIsMellomlagringReady(true);
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
  }, [searchParams, retrieveMellomlagring]);

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
    if (isMellomlagringReady || !isInitialized || isCreateStarted) {
      return;
    }

    try {
      setIsCreateStarted(true);
      const currentLanguage = getLanguageFromSearchParams();
      const translation = translationForLanguage(currentLanguage);
      const response = await createSoknad(appConfig, form, removeFyllutState(submission), currentLanguage, translation);
      updateSubmission(getSubmissionWithFyllutState(response));
      dispatchFyllutMellomlagring({ type: "init", response });
      setInnsendingsId(response?.innsendingsId);
      addQueryParamToUrl("innsendingsId", response?.innsendingsId);
      setIsMellomlagringReady(true);
      return response;
    } catch (error: any) {
      logger?.info("Oppretting av mellomlagring feilet", error);
    }
  };

  const updateMellomlagring = async (submission: Submission): Promise<SendInnSoknadResponse | undefined> => {
    if (!isMellomlagringEnabled || !isMellomlagringReady) {
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
    if (!isMellomlagringEnabled || !innsendingsId) {
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
    if (!isMellomlagringReady) {
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
    isMellomlagringReady,
    mellomlagringError: fyllutMellomlagringState?.error,
  };

  return <SendInnContext.Provider value={value}>{children}</SendInnContext.Provider>;
};

const useSendInn = () => useContext(SendInnContext);

export { SendInnProvider, useSendInn };
