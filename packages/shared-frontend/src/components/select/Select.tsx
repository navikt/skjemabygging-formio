import {
  Select as AkselSelect,
  Checkbox,
  CheckboxGroup,
  UNSAFE_Combobox as Combobox,
  Radio,
  RadioGroup,
} from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, type ChangeEvent, type ReactNode, type Ref } from 'react';
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
  hideLabel?: boolean;
  // values can be provided statically or resolved by a caller-side loader such as useRemoteOptions
  values: ComponentValue[];
  selectText?: string;
  selectType?: SelectType;
  valueType?: SelectValueType;
  defaultValue?: string | ComponentValue;
  presentation?: 'select' | 'radio' | 'checkbox';
  value?: string;
  onChange?: (value: string) => void;
  error?: ReactNode;
  inputRef?: Ref<HTMLFieldSetElement>;
}

const Select = ({
  statePath,
  label,
  hideLabel,
  values,
  description,
  selectText,
  required = true,
  readOnly,
  readMore,
  fieldSize,
  marginBottom,
  selectType = 'auto',
  valueType = 'value',
  defaultValue,
  presentation = 'select',
  value,
  onChange,
  error: controlledError,
  inputRef,
}: SelectProps) => {
  const { translate } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const current = value ?? getCurrentValue(stateValue, valueType);
  const currentError = controlledError ?? error;
  const options = values.map(({ value, label: optionLabel }) => ({
    value,
    label: translate(optionLabel),
  }));
  const selectedOption = options.find((option) => option.value === current);
  const selectedOptions =
    valueType === 'option'
      ? current
        ? [((stateValue as ComponentValue | undefined) ?? selectedOption)!]
        : []
      : selectedOption
        ? [selectedOption]
        : [];
  const renderedSelectType = resolveRenderedSelectType(selectType, options.length);

  useEffect(() => {
    if (value !== undefined || stateValue !== undefined || !defaultValue) {
      return;
    }

    const defaultValueKey =
      typeof defaultValue === 'string'
        ? defaultValue
        : typeof defaultValue === 'object'
          ? defaultValue.value
          : undefined;
    const defaultOption = options.find((option) => option.value === defaultValueKey);
    if (defaultOption) {
      setStateValue(getStateValue(defaultOption.value, valueType, options));
    }
  }, [defaultValue, options, setStateValue, stateValue, value, valueType]);

  const setValue = (nextValue: string) => {
    if (onChange) {
      onChange(nextValue);
      return;
    }
    setStateValue(getStateValue(nextValue, valueType, options));
  };

  const onToggleSelected = (nextValue: string, selected: boolean) => {
    setValue(selected ? nextValue : '');
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setValue(event.target.value);
  };

  return (
    <FormElementBox fieldSize={fieldSize} marginBottom={marginBottom}>
      {presentation === 'checkbox' && options.length === 1 ? (
        <CheckboxGroup
          id={inputId(statePath)}
          legend={
            <TranslatedLabel required={required} readOnly={readOnly} showOptionalText={!hideLabel}>
              {label}
            </TranslatedLabel>
          }
          description={<TranslatedDescription>{description}</TranslatedDescription>}
          value={current === options[0]?.value ? [current] : []}
          onChange={(selectedValues) => setValue(selectedValues[0] ?? '')}
          error={currentError}
          readOnly={readOnly}
          ref={inputRef}
        >
          <Checkbox value={options[0]?.value ?? ''}>{options[0]?.label}</Checkbox>
        </CheckboxGroup>
      ) : presentation === 'radio' ? (
        <RadioGroup
          id={inputId(statePath)}
          tabIndex={-1}
          legend={
            <TranslatedLabel required={required} readOnly={readOnly} showOptionalText={!hideLabel}>
              {label}
            </TranslatedLabel>
          }
          description={<TranslatedDescription>{description}</TranslatedDescription>}
          value={current}
          onChange={setValue}
          error={currentError}
          readOnly={readOnly}
          ref={inputRef}
        >
          {options.map((option) => (
            <Radio key={option.value} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </RadioGroup>
      ) : renderedSelectType === 'select' ? (
        <AkselSelect
          id={inputId(statePath)}
          label={
            <TranslatedLabel required={required} readOnly={readOnly} showOptionalText={!hideLabel}>
              {label}
            </TranslatedLabel>
          }
          description={<TranslatedDescription>{description}</TranslatedDescription>}
          hideLabel={hideLabel}
          value={current}
          onChange={handleSelectChange}
          error={currentError}
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
            <TranslatedLabel required={required} readOnly={readOnly} showOptionalText={!hideLabel}>
              {label}
            </TranslatedLabel>
          }
          description={<TranslatedDescription>{description}</TranslatedDescription>}
          hideLabel={hideLabel}
          options={options}
          selectedOptions={selectedOptions}
          onToggleSelected={onToggleSelected}
          error={currentError}
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
