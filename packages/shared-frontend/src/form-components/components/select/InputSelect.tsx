import { UNSAFE_Combobox as Combobox } from '@navikt/ds-react';
import { ComponentValue, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
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
  const options = values.map(({ value, label: optionLabel }) => ({
    value,
    label: translate(optionLabel),
  }));
  const selectedOption = options.find((option) => option.value === current);

  const onToggleSelected = (value: string, selected: boolean) => {
    updateSubmission(submissionPath, selected ? value : '');
    clearFieldError(submissionPath);
  };

  return (
    <InputBox bottom={bottom}>
      <Combobox
        id={inputId(submissionPath)}
        label={
          <TranslatedLabel required={required} readOnly={readOnly}>
            {label}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        options={options}
        selectedOptions={selectedOption ? [selectedOption] : []}
        onToggleSelected={onToggleSelected}
        error={getError(submissionPath)}
        readOnly={readOnly}
        isMultiSelect={false}
        shouldAutocomplete
        placeholder={selectText ? translate(selectText) : undefined}
      />
    </InputBox>
  );
};

export default InputSelect;
export type { InputSelectProps };
