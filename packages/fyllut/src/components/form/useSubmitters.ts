import { sendInnSoknadApi, useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { dateUtils, Form, formioFormsApiUtils, Language, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { FormPersistenceHandlers, useSubmissionState } from '@navikt/skjemadigitalisering-shared-frontend';
import { useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { buildDigitalFormSearch, isSoknadAlreadyExistsResponse } from './digitalDraftUtils';
import { useNologinToken } from './nologin-token/NologinTokenContext';
import { RECEIPT_KEY } from './wizard/constants';

/**
 * Builds the injected persistence handlers for the new renderer path, branching per submission
 * method. shared-frontend stays decoupled: it only orchestrates when to call these, while fyllut
 * owns the concrete send-inn / mellomlagring IO and the innsendingsId lifecycle.
 *
 * - digital: mellomlagring (create then update draft) + final submit via legacy application-submit/receipt flow.
 * - digitalnologin: single nologin-application submit (wired, not yet e2e-verified).
 * - paper: finalization is handled by the legacy letter/PDF flow (wired, not yet e2e-verified).
 */
const useSubmitters = (form: Form, initialInnsendingsId?: string): FormPersistenceHandlers => {
  const appConfig = useAppConfig();
  const { currentLanguage } = useLanguages();
  const { submissionMethod, logger } = appConfig;
  const { getNologinToken, clearNologinToken } = useNologinToken();
  const { search, state } = useLocation();
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

    const syncInnsendingsIdToUrl = (innsendingsId: string | undefined, submission?: Submission) => {
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

      navigate(
        { search: nextSearch },
        {
          replace: true,
          state:
            submission === undefined
              ? state
              : {
                  ...(typeof state === 'object' && state ? state : {}),
                  initialSubmission: submission,
                  preserveInitialSubmission: true,
                },
        },
      );
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
            const response = await sendInnSoknadApi.createSoknad(
              appConfig,
              navForm,
              submission,
              currentLanguage,
              forceMellomlagring,
            );
            if (isSoknadAlreadyExistsResponse(response)) {
              goToActiveTasks();
              return;
            }
            if (response && 'innsendingsId' in response) {
              innsendingsIdRef.current = response.innsendingsId;
              syncInnsendingsIdToUrl(response.innsendingsId, submission);
              syncSubmissionState(submission, response);
            }
          } else {
            const response = await sendInnSoknadApi.updateSoknad(
              appConfig,
              navForm,
              submission,
              currentLanguage,
              innsendingsIdRef.current,
            );
            syncSubmissionState(submission, response);
          }
        }
      : undefined;

    const ensureInnsendingsId = async (submission: Submission) => {
      if (innsendingsIdRef.current) {
        return innsendingsIdRef.current;
      }

      const response = await sendInnSoknadApi.createSoknad(
        appConfig,
        navForm,
        submission,
        currentLanguage,
        forceMellomlagring,
      );
      if (isSoknadAlreadyExistsResponse(response)) {
        goToActiveTasks();
        return undefined;
      }
      if (response && 'innsendingsId' in response) {
        innsendingsIdRef.current = response.innsendingsId;
        syncInnsendingsIdToUrl(response.innsendingsId, submission);
        syncSubmissionState(submission, response);
      }

      return innsendingsIdRef.current;
    };

    const submitForm = async (submission: Submission) => {
      switch (submissionMethod) {
        case 'digital': {
          const innsendingsId = await ensureInnsendingsId(submission);
          if (!innsendingsId) {
            return;
          }
          if (form.path === 'newrender') {
            let redirectLocation: string | undefined = undefined;
            await sendInnSoknadApi.updateUtfyltSoknad(
              appConfig,
              navForm,
              submission,
              currentLanguage as Language,
              innsendingsId,
              (location) => (redirectLocation = location),
            );
            if (redirectLocation) {
              window.location.href = redirectLocation;
            }
            break;
          }
          const response = await sendInnSoknadApi.postNologinSoknad(
            appConfig,
            '',
            navForm,
            submission,
            currentLanguage as Language,
            submissionMethod,
            innsendingsId,
          );
          navigate(
            { pathname: `/${form.path}/${RECEIPT_KEY}`, search },
            { state: { receipt: response.receipt, pdfBase64: response.pdfBase64 } },
          );
          break;
        }
        case 'digitalnologin': {
          const nologinToken = await getNologinToken();
          const response = await sendInnSoknadApi.postNologinSoknad(
            appConfig,
            nologinToken ?? '',
            navForm,
            submission,
            currentLanguage as Language,
            submissionMethod,
            innsendingsIdRef.current,
          );
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
    submissionMethod,
    logger,
    getNologinToken,
    clearNologinToken,
    setSubmission,
    navigate,
    search,
    state,
    forceMellomlagring,
  ]);
};

export default useSubmitters;
