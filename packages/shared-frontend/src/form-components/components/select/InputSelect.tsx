import { Select } from '@navikt/ds-react';
import { ComponentValue, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent } from 'react';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmission } from '../../../context/submission/SubmissionContext';
import { useValidation } from '../../../context/validation/ValidationContext';
import InputBox, { Spacing } from '../../input/InputBox';
import TranslatedDescription from '../../input/TranslatedDescription';
import TranslatedLabel from '../../input/TranslatedLabel';
import { inputId } from '../../input/inputId';

interface InputSelectProps {
  submissionPath: string;
  label: string;
  values: ComponentValue[];
  description?: string;
  selectText?: string;
  required?: boolean;
  readOnly?: boolean;
  bottom?: Spacing;
}

const InputSelect = ({
  submissionPath,
  label,
  values,
  description,
  selectText,
  required = true,
  readOnly,
  bottom,
}: InputSelectProps) => {
  const { submission, updateSubmission } = useSubmission();
  const { getError, clearFieldError } = useValidation();
  const { translate } = useLanguage();
  const current = submissionUtils.getSubmissionValue(submissionPath, submission) ?? '';

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateSubmission(submissionPath, event.target.value);
    clearFieldError(submissionPath);
  };

  return (
    <InputBox bottom={bottom}>
      <Select
        id={inputId(submissionPath)}
        label={
          <TranslatedLabel required={required} readOnly={readOnly}>
            {label}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        value={current}
        onChange={onChange}
        error={getError(submissionPath)}
        readOnly={readOnly}
      >
        <option value="">{selectText ? translate(selectText) : ''}</option>
        {values.map(({ value, label: optionLabel }) => (
          <option key={value} value={value}>
            {translate(optionLabel)}
          </option>
        ))}
      </Select>
    </InputBox>
  );
};

export default InputSelect;
export type { InputSelectProps };
