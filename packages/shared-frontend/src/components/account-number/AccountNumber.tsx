import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';
import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';

type AccountNumberValidation = Pick<FieldValidationProp, 'minLength' | 'maxLength' | 'pattern' | 'notEqual'>;
interface AccountNumberProps extends Omit<
  InternalTextFieldProps,
  'formatKey' | 'inputMode' | 'spellCheck' | 'validation'
> {
  validation?: AccountNumberValidation;
}

const toAccountNumberValidation = (input: FieldValidationInput) => toFieldValidation(input, { accountNumber: true });

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
export { toAccountNumberValidation };
export type { AccountNumberProps, AccountNumberValidation };
