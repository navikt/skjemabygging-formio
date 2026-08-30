import { Checkbox as AkselCheckbox, ErrorMessage } from '@navikt/ds-react';
import { useEffect } from 'react';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import { BaseFieldProps } from '../types';

interface CheckboxProps extends BaseFieldProps {
  label: string;
  defaultValue?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  showInlineError?: boolean;
}

const Checkbox = ({
  statePath,
  label,
  defaultValue,
  description,
  required = true,
  readOnly,
  readMore,
  fieldSize,
  marginBottom,
  checked,
  onChange,
  showInlineError = true,
}: CheckboxProps) => {
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const current = checked ?? stateValue === true;

  useEffect(() => {
    if (checked !== undefined || typeof stateValue === 'boolean') {
      return;
    }

    if (defaultValue !== undefined) {
      setStateValue(defaultValue);
      return;
    }

    if (readOnly) {
      setStateValue(false);
    }
  }, [checked, defaultValue, readOnly, setStateValue, stateValue]);

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
        <TranslatedLabel required={required} readOnly={readOnly}>
          {label}
        </TranslatedLabel>
      </AkselCheckbox>
      {description && <TranslatedDescription>{description}</TranslatedDescription>}
      {showInlineError && error && <ErrorMessage>{error}</ErrorMessage>}
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default Checkbox;
export type { CheckboxProps };
