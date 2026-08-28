import { dateUtils, Form, Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useApplication } from '../../../context/application/ApplicationContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { Draft, useRuntimeServices } from '../../../context/runtime-services/RuntimeServicesContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useSubmissionMethod } from '../../../context/submission-method/SubmissionMethodContext';
import { b64toBlob } from '../../../utils/blob';
import { buildDigitalFormSearch } from '../../draft/digitalDraftUtils';
import { RECEIPT_KEY } from '../../form-flow/constants';
import prepareSubmissionForTransport from '../../submission/prepareSubmissionForTransport';
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
  const { applications, sessions, submissions } = useRuntimeServices();
  const { logger } = useApplication();
  const { submissionMethod } = useSubmissionMethod();
  const { currentLanguage, translate } = useLanguage();
  const { logEvent } = fyllut;
  const { getNologinToken, clearNologinToken, handleSessionExpired } = useNologinToken();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { setSubmission } = useSubmissionState();
  const forceMellomlagring = new URLSearchParams(search).get('forceMellomlagring') === 'true';
  const innsendingsIdRef = useRef<string | undefined>(
    new URLSearchParams(search).get('innsendingsId') ?? initialInnsendingsId,
  );

  return useMemo<FormActionHandlers>(() => {
    const isDigital = submissionMethod === 'digital';
    const syncSubmissionState = (submission: Submission, draft?: Draft) => {
      if (!draft) {
        return;
      }

      const persistedSubmission = draft.submission ?? submission;

      setSubmission({
        ...persistedSubmission,
        fyllutState: {
          ...persistedSubmission.fyllutState,
          mellomlagring: {
            ...persistedSubmission.fyllutState?.mellomlagring,
            isActive: true,
            savedDate: dateUtils.toLocaleDateAndTime(draft.modifiedAt),
            deletionDate: dateUtils.toLocaleDate(draft.deleteAt),
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
          const transportSubmission = prepareSubmissionForTransport(submission);
          if (!innsendingsIdRef.current) {
            const result = await applications
              .createDraft({
                formPath: form.path,
                submission: transportSubmission,
                language: currentLanguage,
                submissionMethod,
                force: forceMellomlagring,
              })
              .catch((error: unknown) => {
                throw createSaveDraftError(error, TEXTS.statiske.mellomlagringError.create.message);
              });
            if (result.status === 'alreadyExists') {
              goToActiveTasks();
              return;
            }
            innsendingsIdRef.current = result.draft.id;
            syncInnsendingsIdToUrl(result.draft.id);
            syncSubmissionState(transportSubmission, result.draft);
          } else {
            const draft = await applications
              .updateDraft({
                id: innsendingsIdRef.current,
                formPath: form.path,
                submission: transportSubmission,
                language: currentLanguage,
                submissionMethod,
              })
              .catch((error: unknown) => {
                throw createSaveDraftError(error, TEXTS.statiske.mellomlagringError.update.message);
              });
            syncSubmissionState(transportSubmission, draft);
          }
        }
      : undefined;

    const ensureInnsendingsId = async (submission: Submission) => {
      if (innsendingsIdRef.current) {
        return innsendingsIdRef.current;
      }

      const transportSubmission = prepareSubmissionForTransport(submission);
      const result = await applications.createDraft({
        formPath: form.path,
        submission: transportSubmission,
        language: currentLanguage,
        submissionMethod,
        force: forceMellomlagring,
      });
      if (result.status === 'alreadyExists') {
        goToActiveTasks();
        return undefined;
      }
      innsendingsIdRef.current = result.draft.id;
      syncInnsendingsIdToUrl(result.draft.id);
      syncSubmissionState(transportSubmission, result.draft);

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
      const transportSubmission = prepareSubmissionForTransport(submission);
      switch (submissionMethod) {
        case 'digital': {
          const innsendingsId = await ensureInnsendingsId(transportSubmission);
          if (!innsendingsId) {
            return;
          }
          const response = await submissions.submit({
            application: { type: 'draft', id: innsendingsId },
            formPath: form.path,
            submission: transportSubmission,
            language: currentLanguage,
            submissionMethod,
          });
          logSubmissionCompleted();
          setReceiptPdf?.(b64toBlob(response.pdfBase64, 'application/pdf'));
          navigate({ pathname: `/${form.path}/${RECEIPT_KEY}`, search }, { state: { receipt: response.receipt } });
          break;
        }
        case 'digitalnologin': {
          const nologinToken = await getNologinToken();
          let response;
          try {
            response = await submissions.submit({
              application: { type: 'noLogin', token: nologinToken ?? '' },
              formPath: form.path,
              submission: transportSubmission,
              language: currentLanguage,
              submissionMethod,
            });
          } catch (error) {
            if (sessions.isAuthenticationError(error)) {
              handleSessionExpired();
              throw error;
            }
            throw createSaveDraftError(error, TEXTS.statiske.nologin.temporarilyUnavailable);
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
    applications,
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
    sessions,
    navigate,
    search,
    forceMellomlagring,
    submissions,
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
