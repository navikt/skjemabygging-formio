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
  createSoknad,
  deleteSoknad,
  getSoknad,
  SendInnSoknadResponse,
  soknadAlreadyExists,
  updateSoknad,
  updateUtfyltSoknad,
} from '../../api/sendinn/sendInnSoknad';
import { useAppConfig } from '../config/configContext';
import { mellomlagringReducer } from './reducer/mellomlagringReducer';
import { getSubmissionWithFyllutState, transformSubmissionBeforeSubmitting } from './utils/utils';

interface SendInnContextType {
  startMellomlagring: (submission: Submission) => Promise<SendInnSoknadResponse | undefined>;
  updateMellomlagring: (submission: Submission) => Promise<SendInnSoknadResponse | undefined>;
  submitSoknad: (submission: Submission) => Promise<SendInnSoknadResponse | undefined>;
  deleteMellomlagring: () => Promise<{ status: string; info: string } | undefined>;
  isMellomlagringActive: boolean;
  isMellomlagringAvailable: boolean;
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
  const { app, submissionMethod, logger, baseUrl } = appConfig;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const soknadNotFoundUrl = `${baseUrl}/soknad-ikke-funnet`;

  const isMellomlagringAvailable = app === 'fyllut' && submissionMethod === 'digital';
  // isMellomlagringReady is true if we either have successfully fetched or created mellomlagring, or if mellomlagring is not enabled
  const [isMellomlagringReady, setIsMellomlagringReady] = useState(!isMellomlagringAvailable);
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
      updateSubmission(getSubmissionWithFyllutState(response, form));
      dispatchFyllutMellomlagring({ type: 'init', response });
    }
  };

  useEffect(() => {
    const initializeMellomlagring = async () => {
      const innsendingsIdFromParams = searchParams.get('innsendingsId');
      try {
        if (initStatus === 'pending') {
          if (innsendingsIdFromParams) {
            setInitStatus('started');
            setInnsendingsId(innsendingsIdFromParams);
            await retrieveMellomlagring(innsendingsIdFromParams);
            setIsMellomlagringReady(true);
            logger?.info(`${innsendingsIdFromParams}: Mellomlagring was retrieved`);
          }
          setInitStatus('done');
        }
      } catch (error: any) {
        if (error.status === 404) {
          logger?.info(
            `${innsendingsIdFromParams}: Mellomlagring does not exist. Redirects to ${soknadNotFoundUrl}`,
            error as Error,
          );
          const formPath = pathname.split('/')[1];
          const url = formPath ? `${baseUrl}/${formPath}` : `${baseUrl}`;
          navigate('/soknad-ikke-funnet', { state: { url } });
          return;
        }
        logger?.error(`${innsendingsIdFromParams}: Failed to retrieve mellomlagring`, error as Error);
        dispatchFyllutMellomlagring({ type: 'error', error: 'GET_FAILED' });
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
      const forceMellomlagring = !!searchParams.get('forceMellomlagring');
      const response = await createSoknad(
        appConfig,
        form,
        transformSubmissionBeforeSubmitting(submission),
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

      logger?.info(`${response?.innsendingsId}: Successfully created new mellomlagring`);

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
      dispatchFyllutMellomlagring({ type: 'error', error: 'CREATE_FAILED' });
      logger?.error('Failed to create mellomlagring', error);
    }
  };

  const updateMellomlagring = async (submission: Submission): Promise<SendInnSoknadResponse | undefined> => {
    if (!isMellomlagringAvailable || !isMellomlagringReady) {
      return;
    }

    try {
      const currentLanguage = getLanguageFromSearchParams();
      const translation = translationForLanguage(currentLanguage);
      const response = await updateSoknad(
        appConfig,
        form,
        transformSubmissionBeforeSubmitting(submission),
        currentLanguage,
        translation,
        innsendingsId,
      );
      logger?.info(`${innsendingsId}: Mellomlagring was updated`);
      dispatchFyllutMellomlagring({ type: 'update', response });
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        dispatchFyllutMellomlagring({ type: 'error', error: 'UPDATE_FAILED_NOT_FOUND' });
        throw error;
      } else {
        dispatchFyllutMellomlagring({ type: 'error', error: 'UPDATE_FAILED' });
        logger?.error(`${innsendingsId}: Failed to update mellomlagring`, error as Error);
        throw error;
      }
    }
  };

  const deleteMellomlagring = async (): Promise<{ status: string; info: string } | undefined> => {
    if (!isMellomlagringAvailable || !innsendingsId) {
      return;
    }

    try {
      const response = await deleteSoknad(appConfig, innsendingsId);
      logger?.info(`${innsendingsId}: Mellomlagring was deleted`);
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        dispatchFyllutMellomlagring({ type: 'error', error: 'DELETE_FAILED_NOT_FOUND' });
        throw error;
      } else {
        dispatchFyllutMellomlagring({ type: 'error', error: 'DELETE_FAILED' });
        logger?.error(`${innsendingsId}: Failed to delete mellomlagring`, error as Error);
        throw error;
      }
    }
  };

  const submitSoknad = async (appSubmission: Submission) => {
    if (!isMellomlagringReady) {
      return;
    }

    const currentLanguage = getLanguageFromSearchParams();
    const translation = translationForLanguage(currentLanguage);
    const submission = transformSubmissionBeforeSubmitting(appSubmission);
    let redirectLocation: string | undefined = undefined;
    const setRedirectLocation = (loc: string) => (redirectLocation = loc);
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
      logger?.info(`${innsendingsId}: Mellomlagring was submitted`);
      if (redirectLocation) {
        window.location.href = redirectLocation;
      }
      return response;
    } catch (submitError: any) {
      if (submitError.status === 404) {
        dispatchFyllutMellomlagring({ type: 'error', error: 'SUBMIT_FAILED_NOT_FOUND' });
      } else {
        logger?.error(`${innsendingsId}: Failed to submit, will try to store changes`, submitError as Error);
        try {
          await updateSoknad(appConfig, form, submission, currentLanguage, translation, innsendingsId);
          dispatchFyllutMellomlagring({ type: 'error', error: 'SUBMIT_FAILED' });
        } catch (updateError) {
          logger?.error(`${innsendingsId}: Failed to update mellomlagring after a failed submit`, updateError as Error);
          dispatchFyllutMellomlagring({ type: 'error', error: 'SUBMIT_AND_UPDATE_FAILED' });
        }
      }
    }
  };

  const value: SendInnContextType = {
    startMellomlagring,
    updateMellomlagring,
    deleteMellomlagring,
    submitSoknad,
    innsendingsId,
    isMellomlagringAvailable,
    isMellomlagringActive: !!fyllutMellomlagringState?.isActive,
    isMellomlagringReady,
    mellomlagringError: fyllutMellomlagringState?.error,
  };

  return <SendInnContext.Provider value={value}>{children}</SendInnContext.Provider>;
};

const useSendInn = () => useContext(SendInnContext);

export { SendInnProvider, useSendInn };
