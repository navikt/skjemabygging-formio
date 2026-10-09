import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';

const toNationalIdentityNumberValidation = (input: FieldValidationInput) =>
  toFieldValidation(input, { nationalIdentityNumber: true });

export { toNationalIdentityNumberValidation };
