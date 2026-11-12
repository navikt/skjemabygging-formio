import { toSubmissionFormat, toSubmissionNumber } from '../../formatting/inputFormat';
import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';
import { toYearValidation } from './yearValidation';

type YearValidation = Pick<FieldValidationProp, 'minYear' | 'maxYear' | 'notEqual'>;
interface YearProps extends Omit<InternalTextFieldProps, 'formatKey' | 'toStateValue' | 'validation'> {
  validation?: YearValidation;
}

const toYearStateValue = (value: string) => {
  const year = toSubmissionFormat(value, 'year');
  return toSubmissionNumber(year, true) ?? year;
};

const Year = ({ validation, required = true, inputMode = 'numeric', ...props }: YearProps) => (
  <InternalTextField
    {...props}
    required={required}
    inputMode={inputMode}
    formatKey="year"
    toStateValue={toYearStateValue}
    validation={toYearValidation({ ...props, required, validation }).rules}
  />
);

export default Year;
export type { YearProps, YearValidation };
