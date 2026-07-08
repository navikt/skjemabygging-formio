import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent, FocusEvent, useState } from 'react';
import { toInputFormat, toSubmissionFormat } from '../../formatting/inputFormat';
import { useSubmissionField } from './useSubmissionField';

interface UseTextInputArgs {
  pageKey: string;
  pageComponents: Component[];
  submissionPath: string;
  formatKey?: string;
}

/**
 * Text-like input behavior: keep the raw value while typing (never reformat onChange), reformat to
 * the default on blur, convert submission -> input format on first show, clear field error onChange.
 * The value is seeded from submission on mount; inputs remount when the wizard swaps panels, so a
 * field always reflects the current submission when it (re)appears.
 */
const useTextInput = ({ pageKey, pageComponents, submissionPath, formatKey }: UseTextInputArgs) => {
  const { submissionValue, error, setSubmissionValue } = useSubmissionField({
    pageKey,
    pageComponents,
    submissionPath,
  });
  const [value, setValue] = useState(() => toInputFormat(submissionValue, formatKey));

  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(event.target.value);
    setSubmissionValue(event.target.value);
  };

  const onBlur = (_event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const formatted = toInputFormat(value, formatKey);
    setValue(formatted);
    setSubmissionValue(toSubmissionFormat(value, formatKey));
  };

  return { value, onChange, onBlur, error };
};

export { useTextInput };
