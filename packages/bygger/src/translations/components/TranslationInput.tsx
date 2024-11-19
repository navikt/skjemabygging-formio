import { TextField } from '@navikt/ds-react';
import { ChangeEventHandler } from 'react';

interface Props {
  label: string;
  defaultValue?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

const TranslationInput = ({ label, defaultValue, onChange }: Props) => {
  return <TextField label={label} hideLabel size="small" defaultValue={defaultValue} onBlur={onChange} />;
};

export default TranslationInput;
