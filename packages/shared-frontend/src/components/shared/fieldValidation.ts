import { FieldValidation } from '../../context/state/useStateField';
import { ValidationField } from '../../context/validation/validationTypes';
import { FieldValidationProp } from '../types';

interface FieldValidationInput {
  statePath: string;
  /**
   * The visible label (or legend) of the control. It is the only source of the field name used in
   * validation messages, so a message always names the field the way the user sees it.
   */
  label?: string;
  required?: boolean;
  /** Extra rules from the caller: authored constraints, or contextual rules from a parent. */
  validation?: FieldValidationProp;
  /** The value to validate, when the control renders one the state store does not hold. */
  value?: unknown;
}

/**
 * Combines what a component knows about its own value (`intrinsicRules`) with the rules its caller
 * declared, and names the field after the visible label. Every field a component registers - and
 * every field the headless page rebuild derives - goes through here, so the two always agree.
 */
const toFieldValidation = (input: FieldValidationInput, intrinsicRules?: FieldValidationProp): FieldValidation => ({
  field: input.label ?? input.statePath,
  rules: { ...intrinsicRules, ...input.validation, required: input.required },
  ...('value' in input ? { value: input.value } : {}),
});

/** Intrinsic rules of a component whose value must stay one of the options it renders. */
const toChoiceFieldValidation = (
  input: FieldValidationInput,
  values: { value: string }[],
  onlyAvailableOptions?: boolean,
): FieldValidation =>
  toFieldValidation(
    input,
    onlyAvailableOptions ? { onlyAvailableItems: values.map((option) => option.value) } : undefined,
  );

/**
 * The generic registration for one state path. The rendered component registers it through
 * `useStateField`, and the headless page rebuild produces the same entry from the same builder, so
 * a rule is only ever written once.
 */
const toValidationFields = (statePath: string, value: unknown, validation: FieldValidation): ValidationField[] => [
  {
    statePath,
    value: 'value' in validation ? validation.value : value,
    field: validation.field,
    rules: validation.rules,
  },
];

export { toChoiceFieldValidation, toFieldValidation, toValidationFields };
export type { FieldValidationInput };
