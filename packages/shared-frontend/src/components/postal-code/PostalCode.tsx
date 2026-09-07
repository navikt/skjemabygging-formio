import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';
import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';

type PostalCodeValidation = Pick<FieldValidationProp, 'minLength' | 'maxLength' | 'pattern' | 'notEqual'>;
interface PostalCodeProps extends Omit<InternalTextFieldProps, 'formatKey' | 'inputMode' | 'validation'> {
  validation?: PostalCodeValidation;
}

const toPostalCodeValidation = (input: FieldValidationInput) => toFieldValidation(input, { postalCode: true });

const PostalCode = ({ validation, required = true, ...props }: PostalCodeProps) => (
  <InternalTextField
    {...props}
    required={required}
    inputMode="numeric"
    validation={toPostalCodeValidation({ ...props, required, validation }).rules}
  />
);

export default PostalCode;
export { toPostalCodeValidation };
export type { PostalCodeProps, PostalCodeValidation };
