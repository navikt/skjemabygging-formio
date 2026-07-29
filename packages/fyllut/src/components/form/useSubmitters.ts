import { sendInnSoknadApi, useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { dateUtils, Form, formioFormsApiUtils, Language, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { FormPersistenceHandlers } from '@navikt/skjemadigitalisering-shared-frontend';
import { useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { buildDigitalFormSearch, isSoknadAlreadyExistsResponse } from './digitalDraftUtils';

interface NoLoginTokenAdapter {
  getToken: () => Promise<string | undefined>;
  clearToken: () => void;
}

const RECEIPT_PATH = 'kvittering';

const useSubmitters = (
  form: Form,
  initialInnsendingsId: string | undefined,
  noLoginToken: NoLoginTokenAdapter,
): FormPersistenceHandlers => {
  const appConfig = useAppConfig();
  const { currentLanguage } = useLanguages();
  const { submissionMethod, logger } = appConfig;
  const { search, state } = useLocation();
  const navigate = useNavigate();
  const forceMellomlagring = new URLSearchParams(search).get('forceMellomlagring') === 'true';
  const innsendingsIdRef = useRef<string | undefined>(
    new URLSearchParams(search).get('innsendingsId') ?? initialInnsendingsId,
  );

  return useMemo<FormPersistenceHandlers>(() => {
    const navForm = formioFormsApiUtils.mapFormToNavForm(form);
    const syncPersistedSubmission = (
      submission: Submission,
      response?: {
        endretDato: string;
        skalSlettesDato: string;
        hoveddokumentVariant?: { document?: { data?: Submission } };
      },
    ): Submission | undefined => {
      if (!response) {
        return undefined;
      }
      const persistedSubmission = response.hoveddokumentVariant?.document?.data ?? submission;
      return {
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
      };
    };

    const syncInnsendingsIdToUrl = (innsendingsId: string, submission?: Submission) => {
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

    const goToActiveTasks = () =>
      navigate(
        {
          pathname: `/${form.path}/paabegynt`,
          search: buildDigitalFormSearch(search, { forceMellomlagring: undefined }),
        },
        { replace: true },
      );

    const createDraft = async (submission: Submission) => {
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
        const persistedSubmission = syncPersistedSubmission(submission, response);
        syncInnsendingsIdToUrl(response.innsendingsId, persistedSubmission ?? submission);
        return persistedSubmission;
      }
      return undefined;
    };

    const saveDraft =
      submissionMethod === 'digital'
        ? async (submission: Submission) => {
            if (!innsendingsIdRef.current) {
              return await createDraft(submission);
            }
            const response = await sendInnSoknadApi.updateSoknad(
              appConfig,
              navForm,
              submission,
              currentLanguage,
              innsendingsIdRef.current,
            );
            return syncPersistedSubmission(submission, response);
          }
        : undefined;

    const submitForm = async (submission: Submission) => {
      if (submissionMethod === 'digital') {
        const persistedSubmission = innsendingsIdRef.current ? undefined : await createDraft(submission);
        const innsendingsId = innsendingsIdRef.current;
        if (!innsendingsId) {
          return;
        }
        const response = await sendInnSoknadApi.postNologinSoknad(
          appConfig,
          '',
          navForm,
          persistedSubmission ?? submission,
          currentLanguage as Language,
          submissionMethod,
          innsendingsId,
        );
        navigate(
          { pathname: `/${form.path}/${RECEIPT_PATH}`, search },
          { state: { receipt: response.receipt, pdfBase64: response.pdfBase64 } },
        );
        return;
      }

      if (submissionMethod === 'digitalnologin') {
        const token = await noLoginToken.getToken();
        const response = await sendInnSoknadApi.postNologinSoknad(
          appConfig,
          token ?? '',
          navForm,
          submission,
          currentLanguage as Language,
          submissionMethod,
          innsendingsIdRef.current,
        );
        noLoginToken.clearToken();
        navigate(
          { pathname: `/${form.path}/${RECEIPT_PATH}`, search },
          { state: { receipt: response.receipt, pdfBase64: response.pdfBase64 } },
        );
        return;
      }

      logger?.info?.('paper submission finalization is not yet implemented', {
        formPath: form.path,
        submissionMethod,
      });
    };

    return { saveDraft, submitForm };
  }, [
    appConfig,
    currentLanguage,
    forceMellomlagring,
    form,
    logger,
    navigate,
    noLoginToken,
    search,
    state,
    submissionMethod,
  ]);
};

export default useSubmitters;
