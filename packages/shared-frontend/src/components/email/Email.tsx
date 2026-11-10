import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';
import { toEmailValidation } from './emailValidation';

type EmailValidation = Pick<FieldValidationProp, 'minLength' | 'maxLength' | 'pattern' | 'notEqual'>;
interface EmailProps extends Omit<InternalTextFieldProps, 'formatKey' | 'type' | 'validation'> {
  validation?: EmailValidation;
}

const Email = ({ validation, required = true, ...props }: EmailProps) => (
  <InternalTextField
    {...props}
    required={required}
    validation={toEmailValidation({ ...props, required, validation }).rules}
  />
);

export default Email;
export type { EmailProps, EmailValidation };
