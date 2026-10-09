import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';
import { toIbanValidation } from './ibanValidation';

type IbanValidation = Pick<FieldValidationProp, 'minLength' | 'maxLength' | 'pattern' | 'notEqual'>;
interface IbanProps extends Omit<InternalTextFieldProps, 'formatKey' | 'spellCheck' | 'validation'> {
  validation?: IbanValidation;
}

const Iban = ({ validation, required = true, ...props }: IbanProps) => (
  <InternalTextField
    {...props}
    required={required}
    formatKey="iban"
    validation={toIbanValidation({ ...props, required, validation }).rules}
  />
);

export default Iban;
export type { IbanProps, IbanValidation };
