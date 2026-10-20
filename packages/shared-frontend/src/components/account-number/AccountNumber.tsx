import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';
import { toAccountNumberValidation } from './accountNumberValidation';

type AccountNumberValidation = Pick<FieldValidationProp, 'minLength' | 'maxLength' | 'pattern' | 'notEqual'>;
interface AccountNumberProps extends Omit<
  InternalTextFieldProps,
  'formatKey' | 'inputMode' | 'spellCheck' | 'validation'
> {
  validation?: AccountNumberValidation;
}

const AccountNumber = ({ validation, required = true, ...props }: AccountNumberProps) => (
  <InternalTextField
    {...props}
    required={required}
    inputMode="numeric"
    formatKey="accountNumber"
    validation={toAccountNumberValidation({ ...props, required, validation }).rules}
  />
);

export default AccountNumber;
export type { AccountNumberProps, AccountNumberValidation };
