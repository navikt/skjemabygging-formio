import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';
import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';

type NationalIdentityNumberValidation = Pick<FieldValidationProp, 'minLength' | 'maxLength' | 'pattern' | 'notEqual'>;
interface NationalIdentityNumberProps extends Omit<
  InternalTextFieldProps,
  'formatKey' | 'inputMode' | 'spellCheck' | 'validation'
> {
  rawFormat?: boolean;
  validation?: NationalIdentityNumberValidation;
}

const toNationalIdentityNumberValidation = (input: FieldValidationInput) =>
  toFieldValidation(input, { nationalIdentityNumber: true });

const NationalIdentityNumber = ({
  rawFormat = false,
  validation,
  required = true,
  ...props
}: NationalIdentityNumberProps) => (
  <InternalTextField
    {...props}
    required={required}
    inputMode="numeric"
    spellCheck={false}
    formatKey={rawFormat ? 'identityNumberRaw' : 'identityNumber'}
    validation={toNationalIdentityNumberValidation({ ...props, required, validation }).rules}
  />
);

export default NationalIdentityNumber;
export { toNationalIdentityNumberValidation };
export type { NationalIdentityNumberProps, NationalIdentityNumberValidation };
