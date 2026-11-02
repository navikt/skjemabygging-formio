import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';
import { toNationalIdentityNumberValidation } from './nationalIdentityNumberValidation';

type NationalIdentityNumberValidation = Pick<FieldValidationProp, 'minLength' | 'maxLength' | 'pattern' | 'notEqual'>;
interface NationalIdentityNumberProps extends Omit<
  InternalTextFieldProps,
  'formatKey' | 'inputMode' | 'spellCheck' | 'validation'
> {
  rawFormat?: boolean;
  validation?: NationalIdentityNumberValidation;
}

const NationalIdentityNumber = ({
  rawFormat = false,
  validation,
  required = true,
  fieldSize = 'small',
  ...props
}: NationalIdentityNumberProps) => (
  <InternalTextField
    {...props}
    fieldSize={fieldSize}
    required={required}
    inputMode="numeric"
    formatKey={rawFormat ? 'identityNumberRaw' : 'identityNumber'}
    validation={toNationalIdentityNumberValidation({ ...props, required, validation }).rules}
  />
);

export default NationalIdentityNumber;
export type { NationalIdentityNumberProps, NationalIdentityNumberValidation };
