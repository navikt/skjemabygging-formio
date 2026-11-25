import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';

const toTextFieldValidation = (input: FieldValidationInput) => toFieldValidation(input, { supportedCharacters: true });
const toCoverPageTextFieldValidation = (input: FieldValidationInput) =>
  toTextFieldValidation({ ...input, validation: { ...input.validation, coverPageValue: true } });

export { toCoverPageTextFieldValidation, toTextFieldValidation };
