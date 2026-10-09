import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';

type NumberType = 'integer' | 'decimal';

const toNumberFieldValidation = (input: FieldValidationInput, numberType: NumberType) =>
  toFieldValidation(input, { numberType });

export { toNumberFieldValidation };
export type { NumberType };
