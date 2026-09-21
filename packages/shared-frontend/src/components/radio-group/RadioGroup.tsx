import { RadioGroup as AkselRadioGroup, Radio } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { Fragment, type ReactNode, type Ref } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useFieldBinding } from '../../context/state/useFieldBinding';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
import { toChoiceFieldValidation } from '../shared/fieldValidation';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import { BaseFieldProps, ChoiceValidation } from '../types';

interface RadioGroupProps extends Omit<BaseFieldProps, 'label'> {
  legend: string;
  values: ComponentValue[];
  value?: string;
  onChange?: (value: string) => void;
  error?: ReactNode;
  inputRef?: Ref<HTMLFieldSetElement>;
  showOptionalText?: boolean;
  translateValues?: boolean;
  onlyAvailableOptions?: boolean;
  validation?: ChoiceValidation;
}

const RadioGroup = ({
  statePath,
  legend,
  values,
  description,
  required = true,
  readOnly,
  readMore,
  fieldSize,
  marginBottom,
  value,
  onChange,
  error: controlledError,
  inputRef,
  showOptionalText = true,
  translateValues = true,
  onlyAvailableOptions,
  validation,
}: RadioGroupProps) => {
  const { translate } = useLanguage();
  const fieldValidation = toChoiceFieldValidation(
    { statePath, label: legend, required, validation },
    values,
    onlyAvailableOptions,
  );
  const controlled = value !== undefined;
  const { stateValue, error, setStateValue } = useFieldBinding({
    statePath,
    controlled,
    // A controlled group validates the value its owner passes, which is the one it renders.
    validation: controlled ? { ...fieldValidation, value } : fieldValidation,
  });
  const current = value ?? (typeof stateValue === 'string' ? stateValue : '');
  const currentError = controlledError ?? error;

  return (
    <FormElementBox fieldSize={fieldSize} marginBottom={marginBottom}>
      <AkselRadioGroup
        id={inputId(statePath)}
        tabIndex={-1}
        legend={
          <TranslatedLabel
            required={required}
            readOnly={readOnly}
            showOptionalText={showOptionalText}
            translationKey={legend}
          />
        }
        description={<TranslatedDescription translationKey={description} />}
        value={current}
        onChange={(nextValue: string) => (onChange ? onChange(nextValue) : setStateValue(nextValue))}
        error={currentError}
        readOnly={readOnly}
        ref={inputRef}
      >
        {values.map(({ value: optionValue, label, description: optionDescription }) => {
          const translatedLabel = translateValues ? translate(label) : label;
          const translatedDescription = optionDescription ? translate(optionDescription) : undefined;
          const descriptionId = translatedDescription ? `${inputId(statePath)}-${optionValue}-description` : undefined;

          return (
            <Fragment key={optionValue}>
              <Radio value={optionValue} aria-label={translatedLabel} aria-describedby={descriptionId}>
                <>
                  {translatedLabel}
                  {optionDescription && <TranslatedDescription translationKey={optionDescription} />}
                </>
              </Radio>
              {translatedDescription && (
                <span id={descriptionId} hidden>
                  {translatedDescription}
                </span>
              )}
            </Fragment>
          );
        })}
      </AkselRadioGroup>
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default RadioGroup;
export type { RadioGroupProps };
