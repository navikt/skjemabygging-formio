import { UNSAFE_Combobox as Combobox } from '@navikt/ds-react';
import { Component, ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../../context/language/LanguageContext';
import InputBox, { Spacing } from '../../input/InputBox';
import TranslatedDescription from '../../input/TranslatedDescription';
import TranslatedLabel from '../../input/TranslatedLabel';
import { inputId } from '../../input/inputId';
import { useSubmissionField } from '../../input/useSubmissionField';

interface InputSelectProps {
  pageKey: string;
  pageComponents: Component[];
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
  pageKey,
  pageComponents,
  submissionPath,
  label,
  values,
  description,
  selectText,
  required = true,
  readOnly,
  bottom,
}: InputSelectProps) => {
  const { translate } = useLanguage();
  const { submissionValue, error, setSubmissionValue } = useSubmissionField({
    pageKey,
    pageComponents,
    submissionPath,
  });
  const current = submissionValue ?? '';
  const options = values.map(({ value, label: optionLabel }) => ({
    value,
    label: translate(optionLabel),
  }));
  const selectedOption = options.find((option) => option.value === current);

  const onToggleSelected = (value: string, selected: boolean) => {
    setSubmissionValue(selected ? value : '');
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
        error={error}
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
