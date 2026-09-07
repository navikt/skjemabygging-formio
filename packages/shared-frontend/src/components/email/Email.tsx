import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';
import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';

type EmailValidation = Pick<FieldValidationProp, 'minLength' | 'maxLength' | 'pattern' | 'notEqual'>;
interface EmailProps extends Omit<InternalTextFieldProps, 'formatKey' | 'type' | 'validation'> {
  validation?: EmailValidation;
}

const toEmailValidation = (input: FieldValidationInput) => toFieldValidation(input, { email: true });

const Email = ({ validation, required = true, ...props }: EmailProps) => (
  <InternalTextField
    {...props}
    required={required}
    validation={toEmailValidation({ ...props, required, validation }).rules}
  />
);

export default Email;
export { toEmailValidation };
export type { EmailProps, EmailValidation };
