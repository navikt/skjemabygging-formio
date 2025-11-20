import {
  formioFormsApiUtils,
  Language,
  MellomlagringError,
  ReceiptSummary,
  Submission,
} from '@navikt/skjemadigitalisering-shared-domain';
import React, { createContext, useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { postNologinSoknad } from '../../api/sendinn/nologin';
import {
  createSoknad,
  deleteSoknad,
  getSoknad,
  SendInnSoknadResponse,
  soknadAlreadyExists,
  updateSoknad,
  updateUtfyltSoknad,
} from '../../api/sendinn/sendInnSoknad';
import renderPdfForm from '../../form-components/RenderPdfForm';
import { b64toBlob } from '../../util/blob/blob';
import { useAppConfig } from '../config/configContext';
import { useForm } from '../form/FormContext';
import { useLanguages } from '../languages';
import { mellomlagringReducer } from './reducer/mellomlagringReducer';
import { getSubmissionWithFyllutState, transformSubmissionBeforeSubmitting } from './utils/utils';

interface SendInnContextType {
  updateMellomlagring: (submission: Submission) => Promise<SendInnSoknadResponse | undefined>;
  submitSoknad: (submission: Submission) => Promise<void>;
  deleteMellomlagring: () => Promise<{ status: string; info: string } | undefined>;
  isMellomlagringActive: boolean;
  isMellomlagringAvailable: boolean;
  isMellomlagringReady: boolean;
  innsendingsId?: string;
  nologinToken?: string;
  soknadPdfBlob?: Blob;
  setNologinToken: (token: string | undefined) => void;
  setInnsendingsId: (innsendingsId: string | undefined) => void;
  mellomlagringError: MellomlagringError | undefined;
  submitted?: boolean;
  receipt?: ReceiptSummary;
  setReceipt: (receipt: ReceiptSummary | undefined) => void;
}

interface SendInnProviderProps {
  children: React.ReactNode;
}

const SendInnContext = createContext<SendInnContextType>({} as SendInnContextType);

const SendInnProvider = ({ children }: SendInnProviderProps) => {
  const appConfig = useAppConfig();
  const { app, submissionMethod, logger, baseUrl, config } = appConfig;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setSubmission, form, submission, activeComponents, activeAttachmentUploadsPanel } = useForm();
  const soknadNotFoundUrl = `${baseUrl}/soknad-ikke-funnet`;
  const { translationsForNavForm: translations, translate, currentLanguage } = useLanguages();
  const innsendingsIdFromParams = searchParams.get('innsendingsId');

  const isMellomlagringAvailable = app === 'fyllut' && submissionMethod === 'digital';
  // isMellomlagringReady is true if we either have successfully fetched or created mellomlagring, or if mellomlagring is not enabled
  const [isMellomlagringReady, setIsMellomlagringReady] = useState(!isMellomlagringAvailable);
  // Make sure that we only create once
  const [isCreateStarted, setIsCreateStarted] = useState(false);
  const [innsendingsId, setInnsendingsId] = useState<string>();
  const [nologinToken, setNologinToken] = useState<string | undefined>();
  const [fyllutMellomlagringState, dispatchFyllutMellomlagring] = useReducer(mellomlagringReducer, undefined);
  const [soknadPdfBlob, setSoknadPdfBlob] = useState<Blob | undefined>(undefined);
  const [receipt, setReceipt] = useState<ReceiptSummary | undefined>(undefined);

  const addSearchParamToUrl = useCallback(
    (key, value) => {
      if (key && value) {
        setSearchParams(
          (prev) => {
            prev.set(key, value);
            return prev;
          },
          { replace: true },
        );
      }
    },
    [setSearchParams],
  );

  const removeSearchParamFromUrl = useCallback(
    (key) => {
      if (key) {
        setSearchParams(
          (prev) => {
            prev.delete(key);
            return searchParams;
          },
          { replace: true },
        );
      }
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    if (fyllutMellomlagringState && setSubmission) {
      setSubmission((prevSubmission) => {
        return {
          ...prevSubmission,
          fyllutState: {
            ...prevSubmission?.fyllutState,
            mellomlagring: fyllutMellomlagringState,
          },
        } as Submission;
      });
    }
  }, [fyllutMellomlagringState, setSubmission]);

  const retrieveMellomlagring = useCallback(
    async (innsendingsId: string) => {
      const response = await getSoknad(innsendingsId, appConfig);
      if (response?.hoveddokumentVariant.document) {
        addSearchParamToUrl('lang', response.hoveddokumentVariant.document.language);
        setSubmission(getSubmissionWithFyllutState(response, form));
        dispatchFyllutMellomlagring({ type: 'init', response });
      }
    },
    [addSearchParamToUrl, appConfig, form, setSubmission],
  );

  const nbNO: Language = 'nb-NO';

  const translationForLanguage = useCallback(
    (language: Language = nbNO) => {
      if (language !== nbNO && Object.keys(translations).length > 0) {
        return translations[language] ?? {};
      }
      return {};
    },
    [translations],
  );

  const getLanguageFromSearchParams = (): Language => {
    return (new URL(window.location.href).searchParams.get('lang') as Language) || nbNO;
  };

  const startMellomlagring = useCallback(
    async (submission: Submission) => {
      if (isMellomlagringReady || isCreateStarted) {
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
          const url = `/${form.path}/paabegynt?sub=digital`;
          logger?.info(`User already has active tasks for the application. Redirects to ${url}`);
          navigate(url, { replace: true });
          return;
        }

        logger?.info(`${response?.innsendingsId}: Successfully created new mellomlagring`);

        setSubmission(getSubmissionWithFyllutState(response));
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
    },
    [
      isMellomlagringReady,
      isCreateStarted,
      translationForLanguage,
      searchParams,
      appConfig,
      form,
      logger,
      setSubmission,
      removeSearchParamFromUrl,
      addSearchParamToUrl,
      navigate,
    ],
  );

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

  const submitDigitalNologin = useCallback(
    async (language: Language, translation: any, submission: Submission) => {
      try {
        const response = await postNologinSoknad(
          appConfig,
          nologinToken!,
          form!,
          submission,
          language,
          translation,
          renderPdfForm({
            activeComponents,
            activeAttachmentUploadsPanel,
            submission,
            form: formioFormsApiUtils.mapNavFormToForm(form),
            currentLanguage,
            translate,
            isDelingslenke: !!config?.isDelingslenke,
            gitVersion: String(config?.gitVersion),
            submissionMethod,
          }),
        );
        setNologinToken(undefined);
        setSubmission(undefined);
        if (response?.pdfBase64) {
          const pdfBlob = b64toBlob(response.pdfBase64, 'application/pdf');
          setSoknadPdfBlob(pdfBlob);
        }
        if (response?.receipt) {
          setReceipt(response.receipt);
        }
        navigate(`/${form.path}/kvittering?${searchParams.toString()}`);
      } catch (error: any) {
        logger?.error(`${innsendingsId}: Failed to submit nologin application`, {
          errorMessage: error.message,
          innsendingsId,
          language,
          skjemanummer: form.properties.skjemanummer,
        });
        throw error;
      }
    },
    [
      appConfig,
      nologinToken,
      form,
      activeComponents,
      activeAttachmentUploadsPanel,
      currentLanguage,
      translate,
      config?.isDelingslenke,
      config?.gitVersion,
      submissionMethod,
      setSubmission,
      navigate,
      searchParams,
      logger,
      innsendingsId,
    ],
  );

  const submitDigital = useCallback(
    async (language: Language, translation: any, submission: Submission) => {
      if (!isMellomlagringReady) {
        return;
      }

      let redirectLocation: string | undefined = undefined;
      const setRedirectLocation = (loc: string) => (redirectLocation = loc);
      try {
        await updateUtfyltSoknad(
          appConfig,
          form,
          submission,
          language,
          translation,
          innsendingsId,
          setRedirectLocation,
          renderPdfForm({
            activeComponents,
            activeAttachmentUploadsPanel,
            submission,
            form: formioFormsApiUtils.mapNavFormToForm(form),
            currentLanguage,
            translate,
            isDelingslenke: !!config?.isDelingslenke,
            gitVersion: String(config?.gitVersion),
            submissionMethod,
          }),
        );
        logger?.info(`${innsendingsId}: Mellomlagring was submitted`);
        if (redirectLocation) {
          window.location.href = redirectLocation;
        }
      } catch (submitError: any) {
        if (submitError.status === 404) {
          dispatchFyllutMellomlagring({ type: 'error', error: 'SUBMIT_FAILED_NOT_FOUND' });
        } else {
          logger?.error(`${innsendingsId}: Failed to submit, will try to store changes`, submitError as Error);
          try {
            await updateSoknad(appConfig, form, submission, language, translation, innsendingsId);
            dispatchFyllutMellomlagring({ type: 'error', error: 'SUBMIT_FAILED' });
          } catch (updateError) {
            logger?.error(
              `${innsendingsId}: Failed to update mellomlagring after a failed submit`,
              updateError as Error,
            );
            dispatchFyllutMellomlagring({ type: 'error', error: 'SUBMIT_AND_UPDATE_FAILED' });
          }
        }
      }
    },
    [
      activeAttachmentUploadsPanel,
      activeComponents,
      appConfig,
      config?.gitVersion,
      config?.isDelingslenke,
      currentLanguage,
      form,
      innsendingsId,
      isMellomlagringReady,
      logger,
      submissionMethod,
      translate,
    ],
  );

  const submitSoknad = async (appSubmission: Submission): Promise<void> => {
    const currentLanguage = getLanguageFromSearchParams();
    const translation = translationForLanguage(currentLanguage);
    const submission = transformSubmissionBeforeSubmitting(appSubmission);

    if (submissionMethod === 'digitalnologin') {
      await submitDigitalNologin(currentLanguage, translation, submission);
    } else {
      await submitDigital(currentLanguage, translation, submission);
    }
  };

  useEffect(() => {
    const initializeMellomlagring = async () => {
      if (!innsendingsId || innsendingsIdFromParams !== innsendingsId) {
        try {
          if (innsendingsIdFromParams) {
            setInnsendingsId(innsendingsIdFromParams);
            await retrieveMellomlagring(innsendingsIdFromParams);
            setIsMellomlagringReady(true);
            logger?.info(`${innsendingsIdFromParams}: Mellomlagring was retrieved`);
          } else if (isMellomlagringAvailable) {
            const response = await startMellomlagring(submission!);
            if (response) {
              setIsMellomlagringReady(true);
              logger?.info(`${innsendingsIdFromParams}: Mellomlagring was created`);
            }
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
        }
      }
    };

    initializeMellomlagring();
  }, [
    baseUrl,
    innsendingsId,
    innsendingsIdFromParams,
    isMellomlagringAvailable,
    logger,
    navigate,
    pathname,
    retrieveMellomlagring,
    soknadNotFoundUrl,
    startMellomlagring,
    submission,
  ]);

  const value: SendInnContextType = {
    updateMellomlagring,
    deleteMellomlagring,
    submitSoknad,
    innsendingsId,
    setInnsendingsId,
    nologinToken,
    setNologinToken,
    soknadPdfBlob,
    receipt,
    setReceipt,
    isMellomlagringAvailable,
    isMellomlagringActive: !!fyllutMellomlagringState?.isActive,
    isMellomlagringReady,
    mellomlagringError: fyllutMellomlagringState?.error,
    submitted: !!soknadPdfBlob,
  };

  return <SendInnContext.Provider value={value}>{children}</SendInnContext.Provider>;
};

const useSendInn = () => useContext(SendInnContext);

export { SendInnProvider, useSendInn };
