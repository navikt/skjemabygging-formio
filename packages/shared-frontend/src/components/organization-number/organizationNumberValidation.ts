import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';

const toOrganizationNumberValidation = (input: FieldValidationInput) =>
  toFieldValidation(input, { organizationNumber: true });

export { toOrganizationNumberValidation };
