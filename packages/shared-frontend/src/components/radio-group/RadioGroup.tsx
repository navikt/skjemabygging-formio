import { RadioGroup as AkselRadioGroup, Radio } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { Fragment, useEffect } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import { BaseFieldProps } from '../types';

interface RadioGroupProps extends Omit<BaseFieldProps, 'label'> {
  legend: string;
  values: ComponentValue[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  showOptionalText?: boolean;
  translateValues?: boolean;
}

const RadioGroup = ({
  statePath,
  legend,
  values,
  defaultValue,
  description,
  required = true,
  readOnly,
  readMore,
  fieldSize,
  marginBottom,
  value,
  onChange,
  error: controlledError,
  showOptionalText = true,
  translateValues = true,
}: RadioGroupProps) => {
  const { translate } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const current = value ?? (typeof stateValue === 'string' ? stateValue : '');
  const currentError = controlledError ?? error;

  useEffect(() => {
    if (value !== undefined || typeof stateValue === 'string' || !defaultValue) {
      return;
    }

    setStateValue(defaultValue);
  }, [defaultValue, setStateValue, stateValue, value]);

  return (
    <FormElementBox fieldSize={fieldSize} marginBottom={marginBottom}>
      <AkselRadioGroup
        id={inputId(statePath)}
        tabIndex={-1}
        legend={
          <TranslatedLabel required={required} readOnly={readOnly} showOptionalText={showOptionalText}>
            {legend}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        value={current}
        onChange={(nextValue: string) => (onChange ? onChange(nextValue) : setStateValue(nextValue))}
        error={currentError}
        readOnly={readOnly}
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
                  {optionDescription && <TranslatedDescription>{optionDescription}</TranslatedDescription>}
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
