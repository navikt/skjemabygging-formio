import { TextFieldValidation } from '../types';
import InternalTextField, { InternalTextFieldProps, SupportedTextFieldType } from './InternalTextField';
import { toTextFieldValidation } from './textFieldValidation';

interface TextFieldProps extends Omit<InternalTextFieldProps, 'validation'> {
  validation?: TextFieldValidation;
}

const TextField = ({ validation, ...props }: TextFieldProps) => (
  <InternalTextField {...props} validation={toTextFieldValidation({ ...props, validation }).rules} />
);

export default TextField;
export type { SupportedTextFieldType, TextFieldProps };
