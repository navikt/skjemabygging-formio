import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';
import { toYearValidation } from './yearValidation';

type YearValidation = Pick<FieldValidationProp, 'minYear' | 'maxYear' | 'notEqual'>;
interface YearProps extends Omit<InternalTextFieldProps, 'formatKey' | 'validation'> {
  validation?: YearValidation;
}

const Year = ({ validation, required = true, ...props }: YearProps) => (
  <InternalTextField
    {...props}
    required={required}
    formatKey="year"
    validation={toYearValidation({ ...props, required, validation }).rules}
  />
);

export default Year;
export type { YearProps, YearValidation };
