import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';
import { toOrganizationNumberValidation } from './organizationNumberValidation';

type OrganizationNumberValidation = Pick<FieldValidationProp, 'minLength' | 'maxLength' | 'pattern' | 'notEqual'>;
interface OrganizationNumberProps extends Omit<
  InternalTextFieldProps,
  'formatKey' | 'inputMode' | 'spellCheck' | 'validation'
> {
  rawFormat?: boolean;
  validation?: OrganizationNumberValidation;
}

const OrganizationNumber = ({ rawFormat = false, validation, required = true, ...props }: OrganizationNumberProps) => (
  <InternalTextField
    {...props}
    required={required}
    inputMode="numeric"
    formatKey={rawFormat ? 'organizationNumberRaw' : 'organizationNumber'}
    validation={toOrganizationNumberValidation({ ...props, required, validation }).rules}
  />
);

export default OrganizationNumber;
export type { OrganizationNumberProps, OrganizationNumberValidation };
