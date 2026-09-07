import { CheckboxGroup as AkselCheckboxGroup, Checkbox } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
import { toFieldValidation } from '../shared/fieldValidation';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import { BaseFieldProps, ChoiceValidation } from '../types';

interface CheckboxGroupProps extends Omit<BaseFieldProps, 'label'> {
  legend: string;
  values: ComponentValue[];
  value?: string[];
  onChange?: (value: string[]) => unknown;
  error?: string;
  children?: ReactNode;
  translateValues?: boolean;
  validation?: ChoiceValidation;
}

const CheckboxGroup = ({
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
  children,
  translateValues = true,
  validation,
}: CheckboxGroupProps) => {
  const { translate } = useLanguage();
  const fieldValidation = toFieldValidation({ statePath, label: legend, required, validation });
  const { stateValue, error, setStateValue } = useStateField({
    statePath,
    // A controlled group validates the value its owner passes, which is the one it renders.
    validation: value !== undefined ? { ...fieldValidation, value } : fieldValidation,
  });
  const current = value ?? (Array.isArray(stateValue) ? stateValue : []);
  const currentError = controlledError ?? error;

  return (
    <FormElementBox fieldSize={fieldSize} marginBottom={marginBottom}>
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
        {values.map(({ value, label, description }) => (
          <Checkbox key={value} value={value} description={description ? translate(description) : undefined}>
            {translateValues ? translate(label) : label}
          </Checkbox>
        ))}
        {children}
      </AkselCheckboxGroup>
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default CheckboxGroup;
export type { CheckboxGroupProps };
