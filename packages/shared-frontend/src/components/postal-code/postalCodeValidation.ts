import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';

const toPostalCodeValidation = (input: FieldValidationInput) => toFieldValidation(input, { postalCode: true });

export { toPostalCodeValidation };
