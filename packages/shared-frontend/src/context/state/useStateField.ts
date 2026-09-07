import { useCallback } from 'react';
import { ValidationRules } from '../../validation/validators';
import { useFieldValidation } from '../validation/useFieldValidation';
import { useValidation } from '../validation/ValidationContext';
import { useOptionalValidationScope } from '../validation/ValidationScopeContext';
import { useOptionalFieldStateStore } from './StateContext';

interface FieldValidation {
  /** Field name used in validation messages (a label or a translation key). */
  field: string;
  rules: ValidationRules;
  /** Value to validate, when it differs from the value in the state store (controlled inputs). */
  value?: unknown;
}

interface UseStateFieldArgs {
  statePath: string;
  /**
   * The single field this input registers. Omit it only when the component renders no input of its
   * own for `statePath` (a composite reading the answer it distributes to the inputs below).
   */
  validation?: FieldValidation;
}

/**
 * Generic binding between a reusable input component and the active state store, keyed by a
 * `statePath`. All dependencies are optional so a component never crashes when a context is absent:
 *  - the state store (fyllut submission today, other surfaces later) provides value read/write,
 *  - validation + scope (fyllut only) provide the error message and revalidation on change.
 * With none of them present the field is inert (value undefined, no error, no-op setter), which lets
 * the same component be driven purely by props (see the controlled overrides on the components).
 */
const useStateField = ({ statePath, validation }: UseStateFieldArgs) => {
  const store = useOptionalFieldStateStore();
  const { handleFieldChange, updateFieldValue } = useValidation();
  const scope = useOptionalValidationScope();
  const stateValue = store?.getValue(statePath);
  const hasValueOverride = !!validation && 'value' in validation;
  const validationValue = hasValueOverride ? validation.value : stateValue;
  const { error } = useFieldValidation({
    statePath,
    field: validation?.field ?? statePath,
    value: validationValue,
    rules: validation?.rules,
  });

  const setStateValue = useCallback(
    (value: unknown): void => {
      store?.setValue(statePath, value);
      if (scope) {
        if (!hasValueOverride) {
          // Keep the registered value in sync before revalidating, so clicking next right after a
          // change validates the value the user just entered.
          updateFieldValue(scope.pageKey, statePath, value);
        }
        handleFieldChange(scope.pageKey);
      }
    },
    [handleFieldChange, hasValueOverride, scope, statePath, store, updateFieldValue],
  );

  return {
    stateValue,
    error,
    setStateValue,
  };
};

export { useStateField };
export type { FieldValidation, UseStateFieldArgs };
