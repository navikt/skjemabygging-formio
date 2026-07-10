import { RadioGroup as AkselRadioGroup, Radio } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import InputBox from '../input/InputBox';
import TranslatedDescription from '../input/TranslatedDescription';
import TranslatedLabel from '../input/TranslatedLabel';
import { BaseFieldProps } from '../types';

interface RadioGroupProps extends Omit<BaseFieldProps, 'label'> {
  legend: string;
  values: ComponentValue[];
}

const RadioGroup = ({
  statePath,
  legend,
  values,
  description,
  required = true,
  readOnly,
  marginBottom,
}: RadioGroupProps) => {
  const { translate } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const current = stateValue ?? '';

  return (
    <InputBox marginBottom={marginBottom}>
      <AkselRadioGroup
        id={inputId(statePath)}
        legend={
          <TranslatedLabel required={required} readOnly={readOnly}>
            {legend}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        value={current}
        onChange={(value: string) => setStateValue(value)}
        error={error}
        readOnly={readOnly}
      >
        {values.map(({ value, label, description: optionDescription }) => (
          <Radio key={value} value={value} description={optionDescription && translate(optionDescription)}>
            {translate(label)}
          </Radio>
        ))}
      </AkselRadioGroup>
    </InputBox>
  );
};

export default RadioGroup;
export type { RadioGroupProps };
