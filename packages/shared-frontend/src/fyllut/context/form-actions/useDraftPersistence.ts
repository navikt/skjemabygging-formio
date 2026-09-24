import { Form, Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useFormDefinitionSubmissionMethod } from '../../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { Draft, useRuntimeServices } from '../../../context/runtime-services/RuntimeServicesContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { updateSearch } from '../../../utils/searchParams';
import { withDraftMetadata } from '../../draft/withDraftMetadata';
import prepareSubmissionForTransport from '../../submission/prepareSubmissionForTransport';
import { createDraftPersistence } from './draftPersistence';

const createSaveDraftError = (cause: unknown, userMessage: string) => ({ cause, userMessage });

interface DraftPersistence {
  ensureInnsendingsId: (submission: Submission) => Promise<string | undefined>;
  saveDraft?: (submission: Submission) => Promise<void>;
}

const useDraftPersistence = (form: Form, initialInnsendingsId?: string): DraftPersistence => {
  const { applications } = useRuntimeServices();
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const { currentLanguage } = useLanguage();
  const { search } = useLocation();
  const searchRef = useRef(search);
  const navigate = useNavigate();
  const { setSubmission, getLatestSubmission } = useSubmissionState();
  const forceMellomlagring = new URLSearchParams(search).get('forceMellomlagring') === 'true';
  const persist = useRef(
    createDraftPersistence(new URLSearchParams(search).get('innsendingsId') ?? initialInnsendingsId),
  );
  const mounted = useRef(true);

  useLayoutEffect(() => {
    searchRef.current = search;
  }, [search]);

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const isActive = useCallback(() => mounted.current && !!getLatestSubmission(), [getLatestSubmission]);

  const syncInnsendingsIdToUrl = useCallback(
    (innsendingsId: string | undefined) => {
      if (!innsendingsId) {
        return;
      }

      const currentSearch = searchRef.current;
      const nextSearch = updateSearch(currentSearch, {
        sub: 'digital',
        forceMellomlagring: undefined,
        innsendingsId,
      });
      if (nextSearch !== currentSearch) {
        navigate({ search: nextSearch }, { replace: true });
      }
    },
    [navigate],
  );

  const goToActiveTasks = useCallback(
    () =>
      navigate(
        {
          pathname: `/${form.path}/paabegynt`,
          search: updateSearch(searchRef.current, { sub: 'digital', forceMellomlagring: undefined }),
        },
        { replace: true },
      ),
    [form.path, navigate],
  );

  const syncDraft = useCallback(
    (draft: Draft, created: boolean) => {
      // Only server-owned timestamps are reconciled. Neither the request snapshot
      // nor the echoed response owns answers, attachments or renderer state.
      setSubmission((current) => withDraftMetadata(current, draft));
      if (created) {
        syncInnsendingsIdToUrl(draft.id);
      }
    },
    [setSubmission, syncInnsendingsIdToUrl],
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
    (submission: Submission) =>
      persist.current(prepareSubmissionForTransport(submission), {
        create: createDraft,
        sync: syncDraft,
        alreadyExists: goToActiveTasks,
        isActive,
      }),
    [createDraft, goToActiveTasks, isActive, syncDraft],
  );

  const saveDraft =
    submissionMethod === 'digital'
      ? async (submission: Submission) => {
          await persist.current(prepareSubmissionForTransport(submission), {
            create: (transportSubmission) =>
              createDraft(transportSubmission, TEXTS.statiske.mellomlagringError.create.message),
            update: async (id, transportSubmission) => {
              try {
                return await applications.updateDraft({
                  id,
                  formPath: form.path,
                  submission: transportSubmission,
                  language: currentLanguage,
                  submissionMethod,
                });
              } catch (error) {
                throw createSaveDraftError(error, TEXTS.statiske.mellomlagringError.update.message);
              }
            },
            sync: syncDraft,
            alreadyExists: goToActiveTasks,
            isActive,
          });
        }
      : undefined;

  return { ensureInnsendingsId, saveDraft };
};

export { useDraftPersistence };
