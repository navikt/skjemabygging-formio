import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';

const toTextFieldValidation = (input: FieldValidationInput) => toFieldValidation(input);
const toCoverPageTextFieldValidation = (input: FieldValidationInput) =>
  toFieldValidation(input, { coverPageValue: true });

export { toCoverPageTextFieldValidation, toTextFieldValidation };
