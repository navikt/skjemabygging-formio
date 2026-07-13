import TextField from '../text-field/TextField';
import { BaseFieldProps } from '../types';

interface AccountNumberProps extends Omit<BaseFieldProps, 'label'> {
  label: string;
}

const AccountNumber = ({ statePath, label, description, required, readOnly, readMore }: AccountNumberProps) => (
  <TextField
    statePath={statePath}
    label={label}
    description={description}
    required={required}
    readOnly={readOnly}
    readMore={readMore}
    inputMode="numeric"
    spellCheck={false}
    formatKey="accountNumber"
  />
);

export default AccountNumber;
export type { AccountNumberProps };
