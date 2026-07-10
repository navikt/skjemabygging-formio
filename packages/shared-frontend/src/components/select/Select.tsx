import { UNSAFE_Combobox as Combobox } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import InputBox from '../input/InputBox';
import TranslatedDescription from '../input/TranslatedDescription';
import TranslatedLabel from '../input/TranslatedLabel';
import { BaseFieldProps } from '../types';

interface SelectProps extends BaseFieldProps {
  label: string;
  values: ComponentValue[];
  selectText?: string;
}

const Select = ({
  statePath,
  label,
  values,
  description,
  selectText,
  required = true,
  readOnly,
  marginBottom,
}: SelectProps) => {
  const { translate } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const current = stateValue ?? '';
  const options = values.map(({ value, label: optionLabel }) => ({
    value,
    label: translate(optionLabel),
  }));
  const selectedOption = options.find((option) => option.value === current);

  const onToggleSelected = (value: string, selected: boolean) => {
    setStateValue(selected ? value : '');
  };

  return (
    <InputBox marginBottom={marginBottom}>
      <Combobox
        id={inputId(statePath)}
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

export default Select;
export type { SelectProps };
