import { Component, Submission, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback } from 'react';
import { createUpdatedSubmission, useSubmission } from '../../context/submission/SubmissionContext';
import { useValidation } from '../../context/validation/ValidationContext';

interface UseSubmissionFieldArgs {
  pageKey: string;
  pageComponents: Component[];
  submissionPath: string;
}

const useSubmissionField = ({ pageKey, pageComponents, submissionPath }: UseSubmissionFieldArgs) => {
  const { submission, updateSubmission } = useSubmission();
  const { getError, handleFieldChange } = useValidation();

  const setSubmissionValue = useCallback(
    (value: unknown): Submission => {
      const nextSubmission = createUpdatedSubmission(submission, submissionPath, value);
      updateSubmission(submissionPath, value);
      handleFieldChange(pageKey, pageComponents, nextSubmission);
      return nextSubmission;
    },
    [handleFieldChange, pageComponents, pageKey, submission, submissionPath, updateSubmission],
  );

  return {
    submissionValue: submissionUtils.getSubmissionValue(submissionPath, submission),
    error: getError(submissionPath, pageKey, pageComponents),
    setSubmissionValue,
  };
};

export { useSubmissionField };
