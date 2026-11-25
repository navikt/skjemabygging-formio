import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';

const toTextAreaValidation = (input: FieldValidationInput) => toFieldValidation(input, { supportedCharacters: true });

export { toTextAreaValidation };
