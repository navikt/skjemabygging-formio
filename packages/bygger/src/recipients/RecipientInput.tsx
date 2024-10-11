import { TextField } from '@navikt/ds-react';

interface Props {
  label: string;
  defaultValue?: string;
  error?: string | false;
  onChange: (value: string) => void;
}

const RecipientInput = ({ label, defaultValue, error, onChange }: Props) => {
  return (
    <TextField
      label={label}
      hideLabel
      error={error}
      size="small"
      defaultValue={defaultValue}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
};
export default RecipientInput;
