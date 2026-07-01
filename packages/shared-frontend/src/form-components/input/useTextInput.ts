import { submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent, FocusEvent, useState } from 'react';
import { useSubmission } from '../../context/submission/SubmissionContext';
import { useValidation } from '../../context/validation/ValidationContext';
import { toInputFormat, toSubmissionFormat } from '../../formatting/inputFormat';

interface UseTextInputArgs {
  submissionPath: string;
  formatKey?: string;
}

/**
 * Text-like input behavior: keep the raw value while typing (never reformat onChange), reformat to
 * the default on blur, convert submission -> input format on first show, clear field error onChange.
 * The value is seeded from submission on mount; inputs remount when the wizard swaps panels, so a
 * field always reflects the current submission when it (re)appears.
 */
const useTextInput = ({ submissionPath, formatKey }: UseTextInputArgs) => {
  const { submission, updateSubmission } = useSubmission();
  const { getError, clearFieldError } = useValidation();
  const [value, setValue] = useState(() =>
    toInputFormat(submissionUtils.getSubmissionValue(submissionPath, submission), formatKey),
  );

  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(event.target.value);
    updateSubmission(submissionPath, event.target.value);
    clearFieldError(submissionPath);
  };

  const onBlur = (_event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const formatted = toInputFormat(value, formatKey);
    setValue(formatted);
    updateSubmission(submissionPath, toSubmissionFormat(value, formatKey));
  };

  return { value, onChange, onBlur, error: getError(submissionPath) };
};

export { useTextInput };
