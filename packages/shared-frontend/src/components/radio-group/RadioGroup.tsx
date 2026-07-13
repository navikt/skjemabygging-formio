import { RadioGroup as AkselRadioGroup, Radio } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
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
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

const RadioGroup = ({
  statePath,
  legend,
  values,
  description,
  required = true,
  readOnly,
  readMore,
  marginBottom,
  value,
  onChange,
  error: controlledError,
}: RadioGroupProps) => {
  const { translate } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const current = value ?? (typeof stateValue === 'string' ? stateValue : '');
  const currentError = controlledError ?? error;

  return (
    <FormElementBox marginBottom={marginBottom}>
      <AkselRadioGroup
        id={inputId(statePath)}
        legend={
          <TranslatedLabel required={required} readOnly={readOnly}>
            {legend}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        value={current}
        onChange={(nextValue: string) => (onChange ? onChange(nextValue) : setStateValue(nextValue))}
        error={currentError}
        readOnly={readOnly}
      >
        {values.map(({ value, label, description: optionDescription }) => (
          <Radio key={value} value={value} description={optionDescription && translate(optionDescription)}>
            {translate(label)}
          </Radio>
        ))}
      </AkselRadioGroup>
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default RadioGroup;
export type { RadioGroupProps };
