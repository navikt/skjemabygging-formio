import { CheckboxGroup as AkselCheckboxGroup, Checkbox } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import { BaseFieldProps } from '../types';

interface CheckboxGroupProps extends Omit<BaseFieldProps, 'label'> {
  legend: string;
  values: ComponentValue[];
  value?: string[];
  onChange?: (value: string[]) => unknown;
  error?: string;
}

const CheckboxGroup = ({
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
}: CheckboxGroupProps) => {
  const { translate } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const current = value ?? (Array.isArray(stateValue) ? stateValue : []);
  const currentError = controlledError ?? error;

  return (
    <FormElementBox marginBottom={marginBottom}>
      <AkselCheckboxGroup
        id={inputId(statePath)}
        tabIndex={-1}
        legend={
          <TranslatedLabel required={required} readOnly={readOnly}>
            {legend}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        value={current}
        onChange={(nextValue: string[]) => (onChange ? onChange(nextValue) : setStateValue(nextValue))}
        error={currentError}
        readOnly={readOnly}
      >
        {values.map(({ value, label }) => (
          <Checkbox key={value} value={value}>
            {translate(label)}
          </Checkbox>
        ))}
      </AkselCheckboxGroup>
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default CheckboxGroup;
export type { CheckboxGroupProps };
