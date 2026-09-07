import { TextFieldValidation } from '../types';
import InternalTextField, { InternalTextFieldProps, SupportedTextFieldType } from './InternalTextField';

interface TextFieldProps extends Omit<InternalTextFieldProps, 'validation'> {
  validation?: TextFieldValidation;
}

const TextField = (props: TextFieldProps) => <InternalTextField {...props} />;

export default TextField;
export type { SupportedTextFieldType, TextFieldProps };
