import type { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import type { CreateDraftResult, Draft } from '../../../context/runtime-services/RuntimeServices';

interface DraftOperations {
  create: (submission: Submission) => Promise<CreateDraftResult>;
  update?: (id: string, submission: Submission) => Promise<Draft>;
  sync: (draft: Draft, created: boolean) => void;
  alreadyExists: () => void;
  isActive: () => boolean;
}

const createDraftPersistence = (initialId?: string) => {
  let id = initialId;
  let pending = Promise.resolve();
  let redirected = false;

  // Creation, updates and submit's ID lookup share one queue. A second caller must
  // wait for the first creation, and older writes must finish before newer writes.
  return (submission: Submission, operations: DraftOperations): Promise<string | undefined> => {
    const result = pending.then(async () => {
      if (redirected || !operations.isActive()) {
        return undefined;
      }

      let draft: Draft;
      const created = !id;
      if (id) {
        if (!operations.update) {
          return id;
        }
        draft = await operations.update(id, submission);
      } else {
        const result = await operations.create(submission);
        if (result.status === 'alreadyExists') {
          redirected = true;
          if (operations.isActive()) {
            operations.alreadyExists();
          }
          return undefined;
        }
        draft = result.draft;
        id = draft.id;
      }

      if (!operations.isActive()) {
        return undefined;
      }
      operations.sync(draft, created);
      return id;
    });

    // A failed request rejects its caller, but must not poison later retries.
    pending = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  };
};

export { createDraftPersistence };
