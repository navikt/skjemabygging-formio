import { Textarea } from '@navikt/ds-react';
import { ChangeEvent } from 'react';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import { BaseFieldProps } from '../types';

interface TextAreaProps extends BaseFieldProps {
  label: string;
  maxLength?: number;
  value?: string;
  onChange?: (value: string) => void;
}

const TextArea = ({
  statePath,
  label,
  description,
  required = true,
  readOnly,
  maxLength,
  value: controlledValue,
  onChange: controlledOnChange,
  readMore,
  marginBottom,
}: TextAreaProps) => {
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const value = controlledOnChange ? (controlledValue ?? '') : typeof stateValue === 'string' ? stateValue : '';

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (controlledOnChange) {
      controlledOnChange(event.target.value);
    } else {
      setStateValue(event.target.value);
    }
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
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default TextArea;
export type { TextAreaProps };
