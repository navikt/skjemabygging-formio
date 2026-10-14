import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';

const toIbanValidation = (input: FieldValidationInput) => toFieldValidation(input, { iban: true });

export { toIbanValidation };
