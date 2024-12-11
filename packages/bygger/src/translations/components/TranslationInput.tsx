import { TextField, Textarea } from '@navikt/ds-react';
import { FocusEventHandler } from 'react';

interface Props {
  label: string;
  defaultValue?: string;
  minRows: number;
  onChange: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
}

const TranslationInput = ({ label, defaultValue, minRows, onChange, error }: Props) => {
  if (minRows > 2) {
    return (
      <Textarea
        label={label}
        hideLabel
        minRows={minRows}
        resize="vertical"
        defaultValue={defaultValue}
        onBlur={onChange}
        error={error}
      />
    );
  }
  return <TextField label={label} hideLabel defaultValue={defaultValue} onBlur={onChange} error={error} />;
};

export default TranslationInput;
