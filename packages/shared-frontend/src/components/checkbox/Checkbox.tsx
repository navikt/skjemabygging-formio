import { Checkbox as AkselCheckbox, CheckboxGroup as AkselCheckboxGroup } from '@navikt/ds-react';
import { useEffect } from 'react';
import { useFieldBinding } from '../../context/state/useFieldBinding';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
import { toFieldValidation } from '../shared/fieldValidation';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import { BaseFieldProps, ChoiceValidation } from '../types';

interface CheckboxProps extends BaseFieldProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  validation?: ChoiceValidation;
}

const CHECKED_VALUE = 'checked';

const Checkbox = ({
  statePath,
  label,
  description,
  required = true,
  readOnly,
  readMore,
  fieldSize,
  marginBottom,
  checked,
  onChange,
  validation,
}: CheckboxProps) => {
  const { stateValue, error, setStateValue } = useFieldBinding({
    statePath,
    validation: toFieldValidation({ statePath, label, required, validation }),
  });
  const current = checked ?? stateValue === true;

  useEffect(() => {
    if (checked !== undefined || typeof stateValue === 'boolean') {
      return;
    }

    if (readOnly) {
      setStateValue(false);
    }
  }, [checked, readOnly, setStateValue, stateValue]);

  return (
    <FormElementBox fieldSize={fieldSize} marginBottom={marginBottom}>
      <AkselCheckboxGroup
        id={inputId(statePath)}
        tabIndex={-1}
        legend={<TranslatedLabel required={required} readOnly={readOnly} translationKey={label} />}
        hideLegend
        value={current ? [CHECKED_VALUE] : []}
        onChange={(values: string[]) => {
          if (readOnly) {
            return;
          }
          const nextChecked = values.includes(CHECKED_VALUE);
          return onChange ? onChange(nextChecked) : setStateValue(nextChecked);
        }}
        error={error}
        readOnly={readOnly}
      >
        {description && <TranslatedDescription translationKey={description} />}
        <AkselCheckbox value={CHECKED_VALUE}>
          <TranslatedLabel required={required} readOnly={readOnly} translationKey={label} />
        </AkselCheckbox>
      </AkselCheckboxGroup>
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default Checkbox;
export type { CheckboxProps };
