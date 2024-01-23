import {
  FyllutState,
  I18nTranslations,
  Language,
  MellomlagringError,
  NavFormType,
  Submission,
} from '@navikt/skjemadigitalisering-shared-domain';
import React, { createContext, useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  SendInnSoknadResponse,
  createSoknad,
  createSoknadWithoutInnsendingsId,
  deleteSoknad,
  getSoknad,
  soknadAlreadyExists,
  updateSoknad,
  updateUtfyltSoknad,
} from '../../api/sendinn/sendInnSoknad';
import { useAmplitude } from '../amplitude';
import { useAppConfig } from '../config/configContext';
import { mellomlagringReducer } from './reducer/mellomlagringReducer';
import { getSubmissionWithFyllutState, removeFyllutState } from './utils/utils';

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
  formUrl: string;
  translations: I18nTranslations;
  updateSubmission: (submission?: Submission) => void;
  onFyllutStateChange: (fyllutState: Partial<FyllutState>) => void;
}

const SendInnContext = createContext<SendInnContextType>({} as SendInnContextType);

const SendInnProvider = ({
  children,
  form,
  formUrl,
  translations,
  updateSubmission,
  onFyllutStateChange,
}: SendInnProviderProps) => {
  const appConfig = useAppConfig();
  const { app, submissionMethod, featureToggles, logger, baseUrl } = appConfig;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { loggSkjemaFullfort } = useAmplitude();

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
            logger?.info(`Mellomlagring was retrieved. InnsendingsId: ${innsendingsId}`);
          }
          setInitStatus('done');
        }
      } catch (error: any) {
        // Redirect to start of schema if the application is not found. Want a full refresh here to not have to clear the existing state
        if (error.status == 404) {
          const formPath = pathname.split('/')[1];
          const url = formPath ? `${baseUrl}/${formPath}` : `${baseUrl}`;
          logger?.info(
            `Mellomlagring does not exist. Redirects to ${url}. InnsendingsId: ${innsendingsId}`,
            error as Error,
          );
          window.location.assign(url);
          return;
        }
        logger?.error(`Failed to retrieve mellomlagring. InnsendingsId: ${innsendingsId}`, error as Error);
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

    // Complete the initialization before creating if createMellomlagring is not enabled
    // Makes it possible to turn off NEW creations of mellomlagring, by setting createMellomlagring=false in ENABLED_FEATURES, without affecting existing ones
    if (!featureToggles?.enableCreateMellomlagring) {
      setIsMellomlagringReady(true);
      return;
    }

    try {
      setIsCreateStarted(true);
      const currentLanguage = getLanguageFromSearchParams();
      const translation = translationForLanguage(currentLanguage);
      const forceMellomlagring = !!searchParams.get('forceMellomlagring');
      const response = await createSoknad(
        appConfig,
        form,
        removeFyllutState(submission),
        currentLanguage,
        translation,
        forceMellomlagring,
      );

      if (soknadAlreadyExists(response)) {
        const url = `${formUrl}/paabegynt?sub=digital`;
        logger?.info(`User already has active tasks for the application. Redirects to ${url}`);
        navigate(url);
        return;
      }

      logger?.info(`A new mellomlagring was created with innsendingsId ${response?.innsendingsId}`);

      updateSubmission(getSubmissionWithFyllutState(response));
      dispatchFyllutMellomlagring({ type: 'init', response });
      setInnsendingsId(response?.innsendingsId);
      removeSearchParamFromUrl('forceMellomlagring');
      addSearchParamToUrl('innsendingsId', response?.innsendingsId);
      if (response) {
        setIsMellomlagringReady(true);
      }
      return response;
    } catch (error: any) {
      dispatchFyllutMellomlagring({ type: 'error', error: 'CREATE FAILED' });
      logger?.error('Failed to create mellomlagring', error);
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
      logger?.info(`Mellomlagring was updated. InnsendingsId: ${innsendingsId}`);
      dispatchFyllutMellomlagring({ type: 'update', response });
      return response;
    } catch (error) {
      dispatchFyllutMellomlagring({ type: 'error', error: 'UPDATE FAILED' });
      logger?.error(`Failed to update mellomlagring. InnsendingsId: ${innsendingsId}`, error as Error);
      throw error;
    }
  };

  const deleteMellomlagring = async (): Promise<{ status: string; info: string } | undefined> => {
    if (!isMellomlagringEnabled || !innsendingsId) {
      return;
    }

    try {
      const response = await deleteSoknad(appConfig, innsendingsId);
      logger?.info(`Mellomlagring was deleted. InnsendingsId: ${innsendingsId}`);
      return response;
    } catch (error) {
      dispatchFyllutMellomlagring({ type: 'error', error: 'DELETE FAILED' });
      logger?.error(`Failed to delete mellomlagring. InnsendingsId: ${innsendingsId}`, error as Error);
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
    let redirectLocation: string | undefined = undefined;
    const setRedirectLocation = (loc: string) => (redirectLocation = loc);
    if (isMellomlagringEnabled && innsendingsId) {
      try {
        const response = await updateUtfyltSoknad(
          appConfig,
          form,
          submission,
          currentLanguage,
          translation,
          innsendingsId,
          setRedirectLocation,
        );
        logger?.info(`Mellomlagring was submitted. InnsendingsId: ${innsendingsId}`);
        await loggSkjemaFullfort();
        if (redirectLocation) {
          window.location.href = redirectLocation;
        }
        return response;
      } catch (submitError) {
        logger?.error(
          `Failed to submit, will try to store changes. InnsendingsId: ${innsendingsId}`,
          submitError as Error,
        );
        try {
          await updateSoknad(appConfig, form, submission, currentLanguage, translation, innsendingsId);
          dispatchFyllutMellomlagring({ type: 'error', error: 'SUBMIT FAILED' });
        } catch (updateError) {
          logger?.error(
            `Failed to update mellomlagring after a failed submit. InnsendingsId: ${innsendingsId}`,
            updateError as Error,
          );
          dispatchFyllutMellomlagring({ type: 'error', error: 'SUBMIT AND UPDATE FAILED' });
        }
      }
    } else {
      const response = await createSoknadWithoutInnsendingsId(
        appConfig,
        form,
        submission,
        currentLanguage,
        translation,
        setRedirectLocation,
      );
      await loggSkjemaFullfort();
      if (redirectLocation) {
        window.location.href = redirectLocation;
      }
      return response;
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
