import { Textarea } from '@navikt/ds-react';
import InputBox, { Spacing } from '../../input/InputBox';
import TranslatedDescription from '../../input/TranslatedDescription';
import TranslatedLabel from '../../input/TranslatedLabel';
import { inputId } from '../../input/inputId';
import { useTextInput } from '../../input/useTextInput';

interface InputTextAreaProps {
  submissionPath: string;
  label: string;
  description?: string;
  required?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  bottom?: Spacing;
}

const InputTextArea = ({
  submissionPath,
  label,
  description,
  required = true,
  readOnly,
  maxLength,
  bottom,
}: InputTextAreaProps) => {
  const { value, onChange, onBlur, error } = useTextInput({ submissionPath });

  return (
    <InputBox bottom={bottom}>
      <Textarea
        id={inputId(submissionPath)}
        label={
          <TranslatedLabel required={required} readOnly={readOnly}>
            {label}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        readOnly={readOnly}
        maxLength={maxLength}
      />
    </InputBox>
  );
};

export default InputTextArea;
export type { InputTextAreaProps };
