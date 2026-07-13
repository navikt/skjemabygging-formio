import { Select as AkselSelect, UNSAFE_Combobox as Combobox } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import type { ChangeEvent } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import { BaseFieldProps } from '../types';
import { getCurrentValue, getStateValue, resolveRenderedSelectType, SelectType, SelectValueType } from './selectUtils';

interface SelectProps extends BaseFieldProps {
  label: string;
  values: ComponentValue[];
  selectText?: string;
  selectType?: SelectType;
  valueType?: SelectValueType;
}

const Select = ({
  statePath,
  label,
  values,
  description,
  selectText,
  required = true,
  readOnly,
  readMore,
  marginBottom,
  selectType = 'auto',
  valueType = 'value',
}: SelectProps) => {
  const { translate } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const current = getCurrentValue(stateValue, valueType);
  const options = values.map(({ value, label: optionLabel }) => ({
    value,
    label: translate(optionLabel),
  }));
  const selectedOption = options.find((option) => option.value === current);
  const renderedSelectType = resolveRenderedSelectType(selectType, options.length);

  const onToggleSelected = (value: string, selected: boolean) => {
    setStateValue(getStateValue(selected ? value : '', valueType, options));
  };

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStateValue(getStateValue(event.target.value, valueType, options));
  };

  return (
    <FormElementBox marginBottom={marginBottom}>
      {renderedSelectType === 'select' ? (
        <AkselSelect
          id={inputId(statePath)}
          label={
            <TranslatedLabel required={required} readOnly={readOnly}>
              {label}
            </TranslatedLabel>
          }
          description={<TranslatedDescription>{description}</TranslatedDescription>}
          value={current}
          onChange={onChange}
          error={error}
          disabled={readOnly}
        >
          <option value="">{selectText ? translate(selectText) : ''}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </AkselSelect>
      ) : (
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
      )}
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default Select;
export type { SelectProps };
