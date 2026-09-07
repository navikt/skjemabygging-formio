import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';
import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';

type YearValidation = Pick<FieldValidationProp, 'minYear' | 'maxYear' | 'notEqual'>;
interface YearProps extends Omit<InternalTextFieldProps, 'formatKey' | 'validation'> {
  validation?: YearValidation;
}

const toYearValidation = (input: FieldValidationInput) => toFieldValidation(input, { year: true });

const Year = ({ validation, required = true, ...props }: YearProps) => (
  <InternalTextField
    {...props}
    required={required}
    formatKey="year"
    validation={toYearValidation({ ...props, required, validation }).rules}
  />
);

export default Year;
export { toYearValidation };
export type { YearProps, YearValidation };
