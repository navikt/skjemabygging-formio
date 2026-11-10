import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { isSameSubmissionValue } from '../../../context/state/stateHelpers';
import prepareSubmissionForTransport from '../../submission/prepareSubmissionForTransport';

const saveLatestSubmission = async (
  getLatestSubmission: () => Submission | undefined,
  save: (submission: Submission) => Promise<void>,
): Promise<boolean> => {
  let submission = getLatestSubmission();

  while (submission) {
    const savedContent = prepareSubmissionForTransport(submission);
    await save(submission);

    submission = getLatestSubmission();
    if (!submission) {
      return false;
    }

    // Save acknowledgements change renderer timestamps, not the content that needs persisting.
    if (isSameSubmissionValue(savedContent, prepareSubmissionForTransport(submission))) {
      return true;
    }
  }

  return false;
};

export { saveLatestSubmission };
