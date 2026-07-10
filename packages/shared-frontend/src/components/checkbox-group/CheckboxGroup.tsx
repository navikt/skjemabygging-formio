import { CheckboxGroup as AkselCheckboxGroup, Checkbox } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import { BaseFieldProps } from '../types';

interface CheckboxGroupProps extends Omit<BaseFieldProps, 'label'> {
  legend: string;
  values: ComponentValue[];
}

const CheckboxGroup = ({
  statePath,
  legend,
  values,
  description,
  required = true,
  readOnly,
  marginBottom,
}: CheckboxGroupProps) => {
  const { translate } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const current = Array.isArray(stateValue) ? stateValue : [];

  return (
    <FormElementBox marginBottom={marginBottom}>
      <AkselCheckboxGroup
        id={inputId(statePath)}
        legend={
          <TranslatedLabel required={required} readOnly={readOnly}>
            {legend}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        value={current}
        onChange={(value: string[]) => setStateValue(value)}
        error={error}
        readOnly={readOnly}
      >
        {values.map(({ value, label }) => (
          <Checkbox key={value} value={value}>
            {translate(label)}
          </Checkbox>
        ))}
      </AkselCheckboxGroup>
    </FormElementBox>
  );
};

export default CheckboxGroup;
export type { CheckboxGroupProps };
