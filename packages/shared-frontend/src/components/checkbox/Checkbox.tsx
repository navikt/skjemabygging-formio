import { Checkbox as AkselCheckbox, ErrorMessage } from '@navikt/ds-react';
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
  showInlineError?: boolean;
  validation?: ChoiceValidation;
}

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
  showInlineError = true,
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
      <AkselCheckbox
        id={inputId(statePath)}
        checked={current}
        onChange={(event) => {
          if (readOnly) {
            return;
          }
          return onChange ? onChange(event.target.checked) : setStateValue(event.target.checked);
        }}
        error={!!error}
      >
        <TranslatedLabel required={required} readOnly={readOnly} translationKey={label} />
      </AkselCheckbox>
      {description && <TranslatedDescription translationKey={description} />}
      {showInlineError && error && <ErrorMessage>{error}</ErrorMessage>}
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default Checkbox;
export type { CheckboxProps };
