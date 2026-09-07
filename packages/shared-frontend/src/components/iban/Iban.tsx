import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';
import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';

type IbanValidation = Pick<FieldValidationProp, 'minLength' | 'maxLength' | 'pattern' | 'notEqual'>;
interface IbanProps extends Omit<InternalTextFieldProps, 'formatKey' | 'spellCheck' | 'validation'> {
  validation?: IbanValidation;
}

const toIbanValidation = (input: FieldValidationInput) => toFieldValidation(input, { iban: true });

const Iban = ({ validation, required = true, ...props }: IbanProps) => (
  <InternalTextField
    {...props}
    required={required}
    spellCheck={false}
    formatKey="iban"
    validation={toIbanValidation({ ...props, required, validation }).rules}
  />
);

export default Iban;
export { toIbanValidation };
export type { IbanProps, IbanValidation };
