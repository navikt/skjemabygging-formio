import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';
import { toPostalCodeValidation } from './postalCodeValidation';

type PostalCodeValidation = Pick<FieldValidationProp, 'minLength' | 'maxLength' | 'pattern' | 'notEqual'>;
interface PostalCodeProps extends Omit<InternalTextFieldProps, 'formatKey' | 'inputMode' | 'validation'> {
  validation?: PostalCodeValidation;
}

const PostalCode = ({ validation, required = true, ...props }: PostalCodeProps) => (
  <InternalTextField
    {...props}
    required={required}
    inputMode="numeric"
    validation={toPostalCodeValidation({ ...props, required, validation }).rules}
  />
);

export default PostalCode;
export type { PostalCodeProps, PostalCodeValidation };
