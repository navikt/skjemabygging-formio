import { Textarea } from '@navikt/ds-react';
import { ChangeEvent } from 'react';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import FormElementBox from '../form-element-box/FormElementBox';
import TranslatedDescription from '../input/TranslatedDescription';
import TranslatedLabel from '../input/TranslatedLabel';
import { BaseFieldProps } from '../types';

interface TextAreaProps extends BaseFieldProps {
  label: string;
  maxLength?: number;
}

const TextArea = ({
  statePath,
  label,
  description,
  required = true,
  readOnly,
  maxLength,
  marginBottom,
}: TextAreaProps) => {
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const value = typeof stateValue === 'string' ? stateValue : '';

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setStateValue(event.target.value);
  };

  return (
    <FormElementBox marginBottom={marginBottom}>
      <Textarea
        id={inputId(statePath)}
        label={
          <TranslatedLabel required={required} readOnly={readOnly}>
            {label}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        value={value}
        onChange={handleChange}
        error={error}
        readOnly={readOnly}
        maxLength={maxLength}
      />
    </FormElementBox>
  );
};

export default TextArea;
export type { TextAreaProps };
