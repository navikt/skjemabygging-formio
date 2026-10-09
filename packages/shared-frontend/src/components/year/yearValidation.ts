import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';

const toYearValidation = (input: FieldValidationInput) => toFieldValidation(input, { year: true });

export { toYearValidation };
