import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';
import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';

type OrganizationNumberValidation = Pick<FieldValidationProp, 'minLength' | 'maxLength' | 'pattern' | 'notEqual'>;
interface OrganizationNumberProps extends Omit<
  InternalTextFieldProps,
  'formatKey' | 'inputMode' | 'spellCheck' | 'validation'
> {
  rawFormat?: boolean;
  validation?: OrganizationNumberValidation;
}

const toOrganizationNumberValidation = (input: FieldValidationInput) =>
  toFieldValidation(input, { organizationNumber: true });

const OrganizationNumber = ({ rawFormat = false, validation, required = true, ...props }: OrganizationNumberProps) => (
  <InternalTextField
    {...props}
    required={required}
    inputMode="numeric"
    spellCheck={false}
    formatKey={rawFormat ? 'organizationNumberRaw' : 'organizationNumber'}
    validation={toOrganizationNumberValidation({ ...props, required, validation }).rules}
  />
);

export default OrganizationNumber;
export { toOrganizationNumberValidation };
export type { OrganizationNumberProps, OrganizationNumberValidation };
