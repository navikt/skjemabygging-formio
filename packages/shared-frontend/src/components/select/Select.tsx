import { Select as AkselSelect, UNSAFE_Combobox as Combobox } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { type ChangeEvent, type ReactNode } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useFieldBinding } from '../../context/state/useFieldBinding';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
import { toChoiceFieldValidation } from '../shared/fieldValidation';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import { BaseFieldProps, ChoiceValidation } from '../types';
import { getCurrentValue, getStateValue, resolveRenderedSelectType, SelectType, SelectValueType } from './selectUtils';

interface SelectProps extends BaseFieldProps {
  label: string;
  hideLabel?: boolean;
  values: ComponentValue[];
  selectText?: string;
  selectType?: SelectType;
  valueType?: SelectValueType;
  value?: string;
  onChange?: (value: string) => void;
  error?: ReactNode;
  onlyAvailableOptions?: boolean;
  validation?: ChoiceValidation;
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
  value,
  onChange,
  error: controlledError,
  onlyAvailableOptions,
  validation,
}: SelectProps) => {
  const { translate } = useLanguage();
  const fieldValidation = toChoiceFieldValidation(
    { statePath, label, required, validation },
    values,
    onlyAvailableOptions,
  );
  const controlled = value !== undefined;
  const { stateValue, error, setStateValue } = useFieldBinding({
    statePath,
    controlled,
    // A controlled select validates the value its owner passes, which is the one it renders.
    validation: controlled ? { ...fieldValidation, value } : fieldValidation,
  });
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
        ? [(selectedOption ?? (stateValue as ComponentValue | undefined))!]
        : []
      : selectedOption
        ? [selectedOption]
        : [];
  const renderedSelectType = resolveRenderedSelectType(selectType, options.length);

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
    if (readOnly) {
      event.currentTarget.value = current;
      return;
    }
    setValue(event.target.value);
  };

  return (
    <FormElementBox fieldSize={fieldSize} marginBottom={marginBottom}>
      {renderedSelectType === 'select' ? (
        <AkselSelect
          id={inputId(statePath)}
          label={
            <TranslatedLabel
              required={required}
              readOnly={readOnly}
              showOptionalText={!hideLabel}
              translationKey={label}
            />
          }
          description={<TranslatedDescription translationKey={description} />}
          hideLabel={hideLabel}
          value={current}
          onChange={handleSelectChange}
          error={currentError}
          readOnly={readOnly}
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
            <TranslatedLabel
              required={required}
              readOnly={readOnly}
              showOptionalText={!hideLabel}
              translationKey={label}
            />
          }
          description={<TranslatedDescription translationKey={description} />}
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
