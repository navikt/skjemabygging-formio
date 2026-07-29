import { useEffect, useMemo } from 'react';

const DELETED_DRAFT_STORAGE_KEY = 'fyllut:new-render:deleted-draft-id';
const DELETED_DRAFT_QUERY_PARAMETER = 'deletedDraft';

interface DeletedDraftSummary {
  currentDraftId?: string;
  isDeletedDraftSummary: boolean;
}

const useDeletedDraftSummary = (search: string): DeletedDraftSummary => {
  const { currentDraftId, isDeletedDraftSummary } = useMemo(() => {
    const queryParameters = new URLSearchParams(search);
    const currentDraftId = queryParameters.get('innsendingsId') ?? undefined;
    const deletedDraftId = sessionStorage.getItem(DELETED_DRAFT_STORAGE_KEY);
    const matchesDeletedDraft = deletedDraftId !== null && deletedDraftId === currentDraftId;

    return {
      currentDraftId,
      isDeletedDraftSummary: queryParameters.get(DELETED_DRAFT_QUERY_PARAMETER) === '1' || matchesDeletedDraft,
    };
  }, [search]);

  useEffect(() => {
    if (isDeletedDraftSummary) {
      sessionStorage.removeItem(DELETED_DRAFT_STORAGE_KEY);
    }
  }, [isDeletedDraftSummary]);

  return { currentDraftId, isDeletedDraftSummary };
};

export { DELETED_DRAFT_QUERY_PARAMETER, DELETED_DRAFT_STORAGE_KEY, useDeletedDraftSummary };
