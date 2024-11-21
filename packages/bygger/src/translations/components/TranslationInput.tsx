import { TextField, Textarea } from '@navikt/ds-react';
import { FocusEventHandler } from 'react';

interface Props {
  label: string;
  defaultValue?: string;
  minRows: number;
  onChange: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

const TranslationInput = ({ label, defaultValue, minRows, onChange }: Props) => {
  if (minRows > 2) {
    return (
      <Textarea
        label={label}
        hideLabel
        minRows={minRows}
        resize="vertical"
        defaultValue={defaultValue}
        onBlur={onChange}
      />
    );
  }
  return <TextField label={label} hideLabel defaultValue={defaultValue} onBlur={onChange} />;
};

export default TranslationInput;
