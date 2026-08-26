import { dateUtils, Form, formioFormsApiUtils, Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useApplication } from '../../../context/application/ApplicationContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useSubmissionMethod } from '../../../context/submission-method/SubmissionMethodContext';
import { b64toBlob } from '../../../utils/blob';
import { postNologinSoknad } from '../../api/nologinSoknad';
import { createSoknad, soknadAlreadyExists, updateSoknad } from '../../api/sendInnSoknad';
import { buildDigitalFormSearch } from '../../draft/digitalDraftUtils';
import { RECEIPT_KEY } from '../../form-flow/constants';
import { useFyllut } from '../fyllut/FyllutContext';
import { useNologinToken } from '../nologin-token/NologinTokenContext';
import { FormActionHandlers, FormActionsProvider } from './FormActionsContext';

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
const useFyllutFormActions = (
  form: Form,
  initialInnsendingsId?: string,
  setReceiptPdf?: (pdf: Blob) => void,
): FormActionHandlers => {
  const fyllut = useFyllut();
  const { logger } = useApplication();
  const { submissionMethod } = useSubmissionMethod();
  const { currentLanguage, translate } = useLanguage();
  const { logEvent } = fyllut;
  const appConfig = useMemo(() => ({ ...fyllut, logger, submissionMethod }), [fyllut, logger, submissionMethod]);
  const { getNologinToken, clearNologinToken, handleSessionExpired } = useNologinToken();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { setSubmission } = useSubmissionState();
  const forceMellomlagring = new URLSearchParams(search).get('forceMellomlagring') === 'true';
  const innsendingsIdRef = useRef<string | undefined>(
    new URLSearchParams(search).get('innsendingsId') ?? initialInnsendingsId,
  );

  return useMemo<FormActionHandlers>(() => {
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
            currentLanguage,
            submissionMethod,
            innsendingsId,
          );
          logSubmissionCompleted();
          setReceiptPdf?.(b64toBlob(response.pdfBase64, 'application/pdf'));
          navigate({ pathname: `/${form.path}/${RECEIPT_KEY}`, search }, { state: { receipt: response.receipt } });
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
              currentLanguage,
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
          setReceiptPdf?.(b64toBlob(response.pdfBase64, 'application/pdf'));
          navigate({ pathname: `/${form.path}/${RECEIPT_KEY}`, search }, { state: { receipt: response.receipt } });
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

    return { save: saveDraft, submit: submitForm };
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
    setReceiptPdf,
    setSubmission,
    navigate,
    search,
    forceMellomlagring,
  ]);
};

interface Props {
  children: ReactNode;
  form: Form;
  initialInnsendingsId?: string;
  setReceiptPdf: (pdf: Blob) => void;
}

const FyllutFormActionsProvider = ({ children, form, initialInnsendingsId, setReceiptPdf }: Props) => {
  const actions = useFyllutFormActions(form, initialInnsendingsId, setReceiptPdf);

  return (
    <FormActionsProvider save={actions.save} submit={actions.submit}>
      {children}
    </FormActionsProvider>
  );
};

export default FyllutFormActionsProvider;
