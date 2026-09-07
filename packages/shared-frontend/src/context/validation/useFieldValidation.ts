import { useEffect, useMemo, useRef } from 'react';
import { ValidationRules } from '../../validation/validators';
import { useValidation } from './ValidationContext';
import { useOptionalValidationScope } from './ValidationScopeContext';

interface UseFieldValidationArgs {
  statePath: string;
  /** Field name used in validation messages (a label or a translation key). */
  field: string;
  /** The concrete value to validate. */
  value: unknown;
  /** Rules to validate the value against. Omit to opt out of validation for this field. */
  rules?: ValidationRules;
}

/**
 * Registers a field with the active validation scope and returns its current error message.
 *
 * Registration is a React concern: a field is validated exactly while it is rendered inside a
 * validation scope, which is what makes conditional fields, data grid rows and composite components
 * validate the same values the user actually sees. This is the low-level hook behind the two ways
 * of registering: `useStateField` for the input that renders a state-bound value, and
 * `ValidationRegistration` for the few paths that have no such input. Components use those, never
 * this hook directly.
 */
const useFieldValidation = ({ statePath, field, value, rules }: UseFieldValidationArgs) => {
  const { getError, registerField, unregisterField, updateFieldValue } = useValidation();
  const scope = useOptionalValidationScope();
  const pageKey = scope?.pageKey;
  const scopeActive = scope?.active;
  // Components build their rules inline, so a stable serialization - not object identity - decides
  // when the rules actually changed.
  const rulesKey = rules ? JSON.stringify(rules) : undefined;
  const registeredRules = useMemo(
    () => (rulesKey === undefined ? undefined : (JSON.parse(rulesKey) as ValidationRules)),
    [rulesKey],
  );
  const valueRef = useRef(value);

  useEffect(() => {
    if (pageKey === undefined || !registeredRules) {
      return;
    }

    registerField(pageKey, { statePath, value: valueRef.current, field, rules: registeredRules });

    return () => {
      // Leaving a page keeps its registrations so the summary page can validate every page. Only
      // fields that disappear while their scope stays mounted are unregistered. Reading the scope
      // state at cleanup time is the whole point here, so the ref is intentionally read late.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (scopeActive?.current) {
        unregisterField(pageKey, statePath);
      }
    };
  }, [field, pageKey, registerField, registeredRules, scopeActive, statePath, unregisterField]);

  useEffect(() => {
    valueRef.current = value;
    if (pageKey !== undefined && registeredRules) {
      updateFieldValue(pageKey, statePath, value);
    }
  }, [pageKey, registeredRules, statePath, updateFieldValue, value]);

  return { error: pageKey !== undefined ? getError(statePath, pageKey) : undefined };
};

export { useFieldValidation };
export type { UseFieldValidationArgs };
