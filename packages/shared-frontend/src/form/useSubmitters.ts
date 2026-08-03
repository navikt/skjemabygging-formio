import {
  dateUtils,
  Form,
  formioFormsApiUtils,
  Language,
  Submission,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useFyllutAppConfig } from '../context/fyllut/FyllutAppConfigContext';
import { useFyllutLanguage } from '../context/fyllut/FyllutLanguageContext';
import { postNologinSoknad } from './api/nologinSoknad';
import { createSoknad, soknadAlreadyExists, updateSoknad } from './api/sendInnSoknad';
import { buildDigitalFormSearch } from './digitalDraftUtils';
import { FormPersistenceHandlers, useSubmissionState } from './framework';
import { useNologinToken } from './nologin-token/NologinTokenContext';
import { RECEIPT_KEY } from './wizard/constants';

const createSaveDraftError = (cause: unknown, userMessage: string) => ({ cause, userMessage });

/**
 * Builds the injected persistence handlers for the new renderer path, branching per submission
 * method. shared-frontend stays decoupled: it only orchestrates when to call these, while fyllut
 * owns the concrete send-inn / mellomlagring IO and the innsendingsId lifecycle.
 *
 * - digital: mellomlagring (create then update draft) + final submit via shared receipt flow.
 * - digitalnologin: single nologin-application submit (wired, not yet e2e-verified).
 * - paper: finalization is handled by the legacy letter/PDF flow (wired, not yet e2e-verified).
 */
const useSubmitters = (form: Form, initialInnsendingsId?: string): FormPersistenceHandlers => {
  const appConfig = useFyllutAppConfig();
  const { currentLanguage, translate } = useFyllutLanguage();
  const { submissionMethod, logger, logEvent } = appConfig;
  const { getNologinToken, clearNologinToken, handleSessionExpired } = useNologinToken();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { setSubmission } = useSubmissionState();
  const forceMellomlagring = new URLSearchParams(search).get('forceMellomlagring') === 'true';
  const innsendingsIdRef = useRef<string | undefined>(
    new URLSearchParams(search).get('innsendingsId') ?? initialInnsendingsId,
  );

  return useMemo<FormPersistenceHandlers>(() => {
    // Convert at the legacy sendInnSoknadApi boundary (shared-components still uses NavFormType)
    const navForm = formioFormsApiUtils.mapFormToNavForm(form);
    const isDigital = submissionMethod === 'digital';
    const syncSubmissionState = (
      submission: Submission,
      response?: {
        endretDato: string;
        skalSlettesDato: string;
        hoveddokumentVariant?: { document?: { data?: Submission } };
      },
    ) => {
      if (!response) {
        return;
      }

      const persistedSubmission = response.hoveddokumentVariant?.document?.data ?? submission;

      setSubmission({
        ...persistedSubmission,
        fyllutState: {
          ...persistedSubmission.fyllutState,
          mellomlagring: {
            ...persistedSubmission.fyllutState?.mellomlagring,
            isActive: true,
            savedDate: dateUtils.toLocaleDateAndTime(response.endretDato),
            deletionDate: dateUtils.toLocaleDate(response.skalSlettesDato),
          },
        },
      });
    };

    const syncInnsendingsIdToUrl = (innsendingsId: string | undefined) => {
      if (!innsendingsId) {
        return;
      }

      const nextSearch = buildDigitalFormSearch(search, {
        forceMellomlagring: undefined,
        innsendingsId,
      });
      if (nextSearch === search) {
        return;
      }

      navigate({ search: nextSearch }, { replace: true });
    };

    const goToActiveTasks = () => {
      navigate(
        {
          pathname: `/${form.path}/paabegynt`,
          search: buildDigitalFormSearch(search, { forceMellomlagring: undefined }),
        },
        { replace: true },
      );
    };

    const saveDraft = isDigital
      ? async (submission: Submission) => {
          if (!innsendingsIdRef.current) {
            const response = await createSoknad(
              appConfig,
              navForm,
              submission,
              currentLanguage,
              forceMellomlagring,
            ).catch((error: unknown) => {
              throw createSaveDraftError(error, TEXTS.statiske.mellomlagringError.create.message);
            });
            if (soknadAlreadyExists(response)) {
              goToActiveTasks();
              return;
            }
            if (response && 'innsendingsId' in response) {
              innsendingsIdRef.current = response.innsendingsId;
              syncInnsendingsIdToUrl(response.innsendingsId);
              syncSubmissionState(submission, response);
            }
          } else {
            const response = await updateSoknad(
              appConfig,
              navForm,
              submission,
              currentLanguage,
              innsendingsIdRef.current,
            ).catch((error: unknown) => {
              throw createSaveDraftError(error, TEXTS.statiske.mellomlagringError.update.message);
            });
            syncSubmissionState(submission, response);
          }
        }
      : undefined;

    const ensureInnsendingsId = async (submission: Submission) => {
      if (innsendingsIdRef.current) {
        return innsendingsIdRef.current;
      }

      const response = await createSoknad(appConfig, navForm, submission, currentLanguage, forceMellomlagring);
      if (soknadAlreadyExists(response)) {
        goToActiveTasks();
        return undefined;
      }
      if (response && 'innsendingsId' in response) {
        innsendingsIdRef.current = response.innsendingsId;
        syncInnsendingsIdToUrl(response.innsendingsId);
        syncSubmissionState(submission, response);
      }

      return innsendingsIdRef.current;
    };

    const logSubmissionCompleted = () => {
      void logEvent?.({
        name: 'skjema fullført',
        data: {
          skjemaId: form.properties.skjemanummer,
          skjemanavn: translate(form.title),
          tema: form.properties.tema,
          language: currentLanguage,
          submissionMethod,
        },
      });
    };

    const submitForm = async (submission: Submission) => {
      switch (submissionMethod) {
        case 'digital': {
          const innsendingsId = await ensureInnsendingsId(submission);
          if (!innsendingsId) {
            return;
          }
          const response = await postNologinSoknad(
            appConfig,
            '',
            navForm,
            submission,
            currentLanguage as Language,
            submissionMethod,
            innsendingsId,
          );
          logSubmissionCompleted();
          navigate(
            { pathname: `/${form.path}/${RECEIPT_KEY}`, search },
            { state: { receipt: response.receipt, pdfBase64: response.pdfBase64 } },
          );
          break;
        }
        case 'digitalnologin': {
          const nologinToken = await getNologinToken();
          let response;
          try {
            response = await postNologinSoknad(
              appConfig,
              nologinToken ?? '',
              navForm,
              submission,
              currentLanguage as Language,
              submissionMethod,
              innsendingsIdRef.current,
            );
          } catch (error) {
            if (appConfig.http?.isAuthenticationError(error)) {
              handleSessionExpired();
            }
            throw error;
          }
          logSubmissionCompleted();
          clearNologinToken();
          navigate(
            { pathname: `/${form.path}/${RECEIPT_KEY}`, search },
            { state: { receipt: response.receipt, pdfBase64: response.pdfBase64 } },
          );
          break;
        }
        default: {
          logger?.info?.('paper submission finalization is not yet implemented', {
            formPath: form.path,
            submissionMethod,
          });
        }
      }
    };

    return { saveDraft, submitForm };
  }, [
    appConfig,
    form,
    currentLanguage,
    translate,
    submissionMethod,
    logger,
    logEvent,
    getNologinToken,
    clearNologinToken,
    handleSessionExpired,
    setSubmission,
    navigate,
    search,
    forceMellomlagring,
  ]);
};

export default useSubmitters;
