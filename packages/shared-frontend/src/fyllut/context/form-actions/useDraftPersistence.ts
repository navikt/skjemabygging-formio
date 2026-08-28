import { dateUtils, Form, Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useLanguage } from '../../../context/language/LanguageContext';
import { Draft, useRuntimeServices } from '../../../context/runtime-services/RuntimeServicesContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useSubmissionMethod } from '../../../context/submission-method/SubmissionMethodContext';
import { buildDigitalFormSearch } from '../../draft/digitalDraftUtils';
import prepareSubmissionForTransport from '../../submission/prepareSubmissionForTransport';

const createSaveDraftError = (cause: unknown, userMessage: string) => ({ cause, userMessage });

interface DraftPersistence {
  ensureInnsendingsId: (submission: Submission) => Promise<string | undefined>;
  saveDraft?: (submission: Submission) => Promise<void>;
}

const useDraftPersistence = (form: Form, initialInnsendingsId?: string): DraftPersistence => {
  const { applications } = useRuntimeServices();
  const { submissionMethod } = useSubmissionMethod();
  const { currentLanguage } = useLanguage();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { setSubmission } = useSubmissionState();
  const forceMellomlagring = new URLSearchParams(search).get('forceMellomlagring') === 'true';
  const innsendingsIdRef = useRef<string | undefined>(
    new URLSearchParams(search).get('innsendingsId') ?? initialInnsendingsId,
  );

  const syncSubmissionState = useCallback(
    (submission: Submission, draft?: Draft) => {
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
    },
    [setSubmission],
  );

  const syncInnsendingsIdToUrl = useCallback(
    (innsendingsId: string | undefined) => {
      if (!innsendingsId) {
        return;
      }

      const nextSearch = buildDigitalFormSearch(search, {
        forceMellomlagring: undefined,
        innsendingsId,
      });
      if (nextSearch !== search) {
        navigate({ search: nextSearch }, { replace: true });
      }
    },
    [navigate, search],
  );

  const goToActiveTasks = useCallback(
    () =>
      navigate(
        {
          pathname: `/${form.path}/paabegynt`,
          search: buildDigitalFormSearch(search, { forceMellomlagring: undefined }),
        },
        { replace: true },
      ),
    [form.path, navigate, search],
  );

  const createDraft = useCallback(
    async (submission: Submission, errorMessage?: string) => {
      try {
        return await applications.createDraft({
          formPath: form.path,
          submission,
          language: currentLanguage,
          submissionMethod,
          force: forceMellomlagring,
        });
      } catch (error) {
        if (errorMessage) {
          throw createSaveDraftError(error, errorMessage);
        }
        throw error;
      }
    },
    [applications, currentLanguage, forceMellomlagring, form.path, submissionMethod],
  );

  const ensureInnsendingsId = useCallback(
    async (submission: Submission) => {
      if (innsendingsIdRef.current) {
        return innsendingsIdRef.current;
      }

      const transportSubmission = prepareSubmissionForTransport(submission);
      const result = await createDraft(transportSubmission);
      if (result.status === 'alreadyExists') {
        goToActiveTasks();
        return undefined;
      }

      innsendingsIdRef.current = result.draft.id;
      syncInnsendingsIdToUrl(result.draft.id);
      syncSubmissionState(transportSubmission, result.draft);
      return innsendingsIdRef.current;
    },
    [createDraft, goToActiveTasks, syncInnsendingsIdToUrl, syncSubmissionState],
  );

  const saveDraft =
    submissionMethod === 'digital'
      ? async (submission: Submission) => {
          const transportSubmission = prepareSubmissionForTransport(submission);
          if (!innsendingsIdRef.current) {
            const result = await createDraft(transportSubmission, TEXTS.statiske.mellomlagringError.create.message);
            if (result.status === 'alreadyExists') {
              goToActiveTasks();
              return;
            }

            innsendingsIdRef.current = result.draft.id;
            syncInnsendingsIdToUrl(result.draft.id);
            syncSubmissionState(transportSubmission, result.draft);
            return;
          }

          let draft: Draft;
          try {
            draft = await applications.updateDraft({
              id: innsendingsIdRef.current,
              formPath: form.path,
              submission: transportSubmission,
              language: currentLanguage,
              submissionMethod,
            });
          } catch (error) {
            throw createSaveDraftError(error, TEXTS.statiske.mellomlagringError.update.message);
          }
          syncSubmissionState(transportSubmission, draft);
        }
      : undefined;

  return { ensureInnsendingsId, saveDraft };
};

export { useDraftPersistence };
