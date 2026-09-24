import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';

const toAccountNumberValidation = (input: FieldValidationInput) => toFieldValidation(input, { accountNumber: true });

export { toAccountNumberValidation };
