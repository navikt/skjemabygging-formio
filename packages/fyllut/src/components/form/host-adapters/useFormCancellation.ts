import { sendInnSoknadApi, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import type { Submission, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import type {
  FormRendererAttachmentAdapter,
  FormRendererSecondaryActions,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useCallback } from 'react';
import { DELETED_DRAFT_QUERY_PARAMETER, DELETED_DRAFT_STORAGE_KEY } from './useDeletedDraftSummary';

interface UseFormCancellationParameters {
  attachmentAdapter: FormRendererAttachmentAdapter;
  currentDraftId?: string;
  submissionMethod: SubmissionMethod | undefined;
}

const useFormCancellation = ({
  attachmentAdapter,
  currentDraftId,
  submissionMethod,
}: UseFormCancellationParameters): FormRendererSecondaryActions['cancel'] => {
  const appConfig = useAppConfig();

  return useCallback(
    async (_submission: Submission | undefined) => {
      if (submissionMethod === 'digital' && currentDraftId) {
        await sendInnSoknadApi.deleteSoknad(appConfig, currentDraftId);
        sessionStorage.setItem(DELETED_DRAFT_STORAGE_KEY, currentDraftId);
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set(DELETED_DRAFT_QUERY_PARAMETER, '1');
        window.history.replaceState(window.history.state, '', currentUrl.toString());
        return;
      }
      if (submissionMethod === 'digitalnologin') {
        await attachmentAdapter.deleteAllFiles();
      }
    },
    [appConfig, attachmentAdapter, currentDraftId, submissionMethod],
  );
};

export default useFormCancellation;
