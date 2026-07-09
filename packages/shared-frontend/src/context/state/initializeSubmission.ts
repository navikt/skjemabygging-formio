import { Submission, SubmissionData, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';

interface InitializeSubmissionArgs {
  resumedSubmission?: Submission;
  prefillData?: SubmissionData;
  defaults?: SubmissionData;
}

/**
 * Resolves the starting submission. Precedence: resumed answers win, prefill/defaults only fill
 * fields that are still empty, and existing user data is never overwritten.
 */
const initializeSubmission = ({ resumedSubmission, prefillData, defaults }: InitializeSubmissionArgs): Submission => {
  const resumedData = resumedSubmission?.data ?? {};
  const fillIns: SubmissionData = { ...defaults, ...prefillData };
  const data: SubmissionData = { ...resumedData };

  Object.entries(fillIns).forEach(([key, value]) => {
    if (validatorUtils.isEmpty(data[key])) {
      data[key] = value;
    }
  });

  return { ...resumedSubmission, data };
};

export { initializeSubmission };
export type { InitializeSubmissionArgs };
