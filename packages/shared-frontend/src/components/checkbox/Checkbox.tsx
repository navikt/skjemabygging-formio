import { Checkbox as AkselCheckbox, ErrorMessage } from '@navikt/ds-react';
import { useEffect } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
import FormElementBox from '../shared/FormElementBox';
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
  marginBottom,
  checked,
  onChange,
  showInlineError = true,
}: CheckboxProps) => {
  const { translate } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const current = checked ?? stateValue === true;

  useEffect(() => {
    if (checked !== undefined || typeof stateValue === 'boolean' || defaultValue === undefined) {
      return;
    }

    setStateValue(defaultValue);
  }, [checked, defaultValue, setStateValue, stateValue]);

  return (
    <FormElementBox marginBottom={marginBottom}>
      <AkselCheckbox
        id={inputId(statePath)}
        checked={current}
        onChange={(event) => (onChange ? onChange(event.target.checked) : setStateValue(event.target.checked))}
        error={!!error}
        readOnly={readOnly}
        description={description ? translate(description) : undefined}
      >
        <TranslatedLabel required={required} readOnly={readOnly}>
          {label}
        </TranslatedLabel>
      </AkselCheckbox>
      {showInlineError && error && <ErrorMessage>{error}</ErrorMessage>}
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default Checkbox;
export type { CheckboxProps };
