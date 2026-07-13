import TextField from '../text-field/TextField';
import { BaseFieldProps } from '../types';

interface IbanProps extends Omit<BaseFieldProps, 'label'> {
  label: string;
}

const Iban = ({ statePath, label, description, required, readOnly, readMore }: IbanProps) => (
  <TextField
    statePath={statePath}
    label={label}
    description={description}
    required={required}
    readOnly={readOnly}
    readMore={readMore}
    spellCheck={false}
    formatKey="iban"
  />
);

export default Iban;
export type { IbanProps };
