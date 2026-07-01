import { Radio, RadioGroup } from '@navikt/ds-react';
import { ComponentValue, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmission } from '../../../context/submission/SubmissionContext';
import { useValidation } from '../../../context/validation/ValidationContext';
import InputBox, { Spacing } from '../../input/InputBox';
import TranslatedDescription from '../../input/TranslatedDescription';
import TranslatedLabel from '../../input/TranslatedLabel';
import { inputId } from '../../input/inputId';

interface InputRadioProps {
  submissionPath: string;
  legend: string;
  values: ComponentValue[];
  description?: string;
  required?: boolean;
  readOnly?: boolean;
  bottom?: Spacing;
}

const InputRadio = ({
  submissionPath,
  legend,
  values,
  description,
  required = true,
  readOnly,
  bottom,
}: InputRadioProps) => {
  const { submission, updateSubmission } = useSubmission();
  const { getError, clearFieldError } = useValidation();
  const { translate } = useLanguage();
  const current = submissionUtils.getSubmissionValue(submissionPath, submission) ?? '';

  const onChange = (value: string) => {
    updateSubmission(submissionPath, value);
    clearFieldError(submissionPath);
  };

  return (
    <InputBox bottom={bottom}>
      <RadioGroup
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
        {values.map(({ value, label, description: optionDescription }) => (
          <Radio key={value} value={value} description={optionDescription && translate(optionDescription)}>
            {translate(label)}
          </Radio>
        ))}
      </RadioGroup>
    </InputBox>
  );
};

export default InputRadio;
export type { InputRadioProps };
