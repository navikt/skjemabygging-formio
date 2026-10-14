import { dateUtils, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import type { Draft } from '../../context/runtime-services/RuntimeServices';

const withDraftMetadata = (submission: Submission | undefined, draft: Draft): Submission | undefined => {
  if (!submission) {
    return submission;
  }

  return {
    ...submission,
    fyllutState: {
      ...submission.fyllutState,
      mellomlagring: {
        ...submission.fyllutState?.mellomlagring,
        isActive: true,
        savedDate: dateUtils.toLocaleDateAndTime(draft.modifiedAt),
        deletionDate: dateUtils.toLocaleDate(draft.deleteAt),
      },
    },
  };
};

export { withDraftMetadata };
