import {
  FyllutState,
  I18nTranslations,
  Language,
  MellomlagringError,
  NavFormType,
  Submission,
} from '@navikt/skjemadigitalisering-shared-domain';
import React, { createContext, useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  SendInnSoknadResponse,
  createSoknad,
  createSoknadWithoutInnsendingsId,
  deleteSoknad,
  getSoknad,
  updateSoknad,
  updateUtfyltSoknad,
} from '../../api/sendInnSoknad';
import { useAppConfig } from '../../configContext';
import { mellomlagringReducer } from './mellomlagringReducer';
import { getSubmissionWithFyllutState, removeFyllutState } from './utils';

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
  const { app, submissionMethod, featureToggles, logger, baseUrl } = appConfig;
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isMellomlagringEnabled =
    app === 'fyllut' && submissionMethod === 'digital' && !!featureToggles?.enableMellomlagring;
  // isMellomlagringReady is true if we either have successfully fetched or created mellomlagring, or if mellomlagring is not enabled
  const [isMellomlagringReady, setIsMellomlagringReady] = useState(!isMellomlagringEnabled);
  const [initStatus, setInitStatus] = useState<'pending' | 'started' | 'done' | 'error'>('pending');
  // Make sure that we only create once
  const [isCreateStarted, setIsCreateStarted] = useState(false);
  const [innsendingsId, setInnsendingsId] = useState<string>();
  const [fyllutMellomlagringState, dispatchFyllutMellomlagring] = useReducer(mellomlagringReducer, undefined);

  const addSearchParamToUrl = useCallback(
    (key, value) => {
      if (key && value) {
        setSearchParams((prev) => {
          prev.set(key, value);
          return prev;
        });
      }
    },
    [pathname],
  );

  const removeSearchParamFromUrl = useCallback(
    (key) => {
      if (key) {
        setSearchParams((prev) => {
          prev.delete(key);
          return searchParams;
        });
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
      addSearchParamToUrl('lang', response.hoveddokumentVariant.document.language);
      updateSubmission(getSubmissionWithFyllutState(response));
      dispatchFyllutMellomlagring({ type: 'init', response });
    }
  };

  useEffect(() => {
    const initializeMellomlagring = async () => {
      try {
        if (initStatus === 'pending') {
          const innsendingsId = searchParams.get('innsendingsId');
          if (innsendingsId) {
            setInitStatus('started');
            setInnsendingsId(innsendingsId);
            await retrieveMellomlagring(innsendingsId);
            setIsMellomlagringReady(true);
          }
          setInitStatus('done');
        }
      } catch (error: any) {
        // Redirect to start of schema if the application is not found. Want a full refresh here to not have to clear the existing state
        if (error.status == 404) {
          const formPath = pathname.split('/')[1];
          window.location.assign(formPath ? `${baseUrl}/${formPath}` : `${baseUrl}`);
          return;
        }

        dispatchFyllutMellomlagring({ type: 'error', error: 'GET FAILED' });
        setInitStatus('error');
      }
    };
    initializeMellomlagring();
  }, [searchParams, retrieveMellomlagring]);

  const nbNO: Language = 'nb-NO';

  const translationForLanguage = (language: Language = nbNO) => {
    if (language !== nbNO && Object.keys(translations).length > 0) {
      return translations[language] ?? {};
    }
    return {};
  };

  const getLanguageFromSearchParams = (): Language => {
    return (new URL(window.location.href).searchParams.get('lang') as Language) || nbNO;
  };

  const startMellomlagring = async (submission: Submission) => {
    if (isMellomlagringReady || initStatus !== 'done' || isCreateStarted) {
      return;
    }

    try {
      setIsCreateStarted(true);
      const currentLanguage = getLanguageFromSearchParams();
      const translation = translationForLanguage(currentLanguage);
      const opprettNySoknad = !!searchParams.get('opprettNySoknad');
      const response = await createSoknad(
        appConfig,
        form,
        removeFyllutState(submission),
        currentLanguage,
        translation,
        opprettNySoknad,
      );
      updateSubmission(getSubmissionWithFyllutState(response));
      dispatchFyllutMellomlagring({ type: 'init', response });
      setInnsendingsId(response?.innsendingsId);
      removeSearchParamFromUrl('opprettNySoknad');
      addSearchParamToUrl('innsendingsId', response?.innsendingsId);
      if (response) {
        setIsMellomlagringReady(true);
      }
      return response;
    } catch (error: any) {
      dispatchFyllutMellomlagring({ type: 'error', error: 'CREATE FAILED' });
      logger?.info('Oppretting av mellomlagring feilet', error);
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
      dispatchFyllutMellomlagring({ type: 'update', response });
      return response;
    } catch (error) {
      dispatchFyllutMellomlagring({ type: 'error', error: 'UPDATE FAILED' });
      logger?.info('Oppdatering av mellomlagring feilet', error as Error);
      throw error;
    }
  };

  const deleteMellomlagring = async (): Promise<{ status: string; info: string } | undefined> => {
    if (!isMellomlagringEnabled || !innsendingsId) {
      return;
    }

    try {
      return await deleteSoknad(appConfig, innsendingsId);
    } catch (error) {
      dispatchFyllutMellomlagring({ type: 'error', error: 'DELETE FAILED' });
      logger?.info('Sletting av mellomlagring feilet', error as Error);
      throw error;
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
      } catch (error) {
        try {
          await updateSoknad(appConfig, form, submission, currentLanguage, translation, innsendingsId);
          dispatchFyllutMellomlagring({ type: 'error', error: 'SUBMIT FAILED' });
        } catch (error) {
          dispatchFyllutMellomlagring({ type: 'error', error: 'SUBMIT AND UPDATE FAILED' });
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
