import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { ComponentValue, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmission } from '../../../context/submission/SubmissionContext';
import { useValidation } from '../../../context/validation/ValidationContext';
import InputBox, { Spacing } from '../../input/InputBox';
import TranslatedDescription from '../../input/TranslatedDescription';
import TranslatedLabel from '../../input/TranslatedLabel';
import { inputId } from '../../input/inputId';

interface InputCheckboxProps {
  submissionPath: string;
  legend: string;
  values: ComponentValue[];
  description?: string;
  required?: boolean;
  readOnly?: boolean;
  bottom?: Spacing;
}

const InputCheckbox = ({
  submissionPath,
  legend,
  values,
  description,
  required = true,
  readOnly,
  bottom,
}: InputCheckboxProps) => {
  const { submission, updateSubmission } = useSubmission();
  const { getError, clearFieldError } = useValidation();
  const { translate } = useLanguage();
  const current = submissionUtils.getSubmissionValue(submissionPath, submission) ?? [];

  const onChange = (value: string[]) => {
    updateSubmission(submissionPath, value);
    clearFieldError(submissionPath);
  };

  return (
    <InputBox bottom={bottom}>
      <CheckboxGroup
        id={inputId(submissionPath)}
        legend={
          <TranslatedLabel required={required} readOnly={readOnly}>
            {legend}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        value={current}
        onChange={onChange}
        error={getError(submissionPath)}
        readOnly={readOnly}
      >
        {values.map(({ value, label }) => (
          <Checkbox key={value} value={value}>
            {translate(label)}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </InputBox>
  );
};

export default InputCheckbox;
export type { InputCheckboxProps };
