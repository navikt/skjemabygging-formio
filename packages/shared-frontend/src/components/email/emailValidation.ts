import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';

const toEmailValidation = (input: FieldValidationInput) => toFieldValidation(input, { email: true });

export { toEmailValidation };
