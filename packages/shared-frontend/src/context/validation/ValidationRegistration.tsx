import { ValidationRules } from '../../validation/validators';
import { useFieldValidation } from './useFieldValidation';

interface ValidationRegistrationProps {
  /** The visible label of the control the rule belongs to; it names the field in messages. */
  label: string;
  statePath: string;
  /** The concrete value to validate. */
  value: unknown;
  rules: ValidationRules;
}

/**
 * Declares a validated field for a path that has no state-bound input of its own.
 *
 * Almost every field is registered by the input that renders it (`useStateField`), which is what
 * keeps one owner per state path. A few paths have no such input: the attachment choice and the
 * uploaded files live outside the submission state, and the days of a driving list are picked in
 * several period accordions at once. Their owner declares them with this component instead, using
 * the same registration model, and the controls below only render the resulting error.
 *
 * It deliberately accepts nothing but a visible label, a path, a value and rules, so it can never
 * become a second way of configuring a field.
 */
const ValidationRegistration = ({ label, statePath, value, rules }: ValidationRegistrationProps) => {
  useFieldValidation({ statePath, field: label, value, rules });

  return null;
};

export default ValidationRegistration;
export type { ValidationRegistrationProps };
