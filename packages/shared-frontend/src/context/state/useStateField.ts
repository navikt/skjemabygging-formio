import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback } from 'react';
import { useValidation } from '../validation/ValidationContext';
import { useOptionalValidationScope } from '../validation/ValidationScopeContext';
import { useOptionalFieldStateStore } from './StateContext';

interface UseStateFieldArgs {
  statePath: string;
}

/**
 * Generic binding between a reusable input component and the active state store, keyed by a
 * `statePath`. All dependencies are optional so a component never crashes when a context is absent:
 *  - the state store (fyllut submission today, other surfaces later) provides value read/write,
 *  - validation + scope (fyllut only) provide the error message and revalidation on change.
 * With none of them present the field is inert (value undefined, no error, no-op setter), which lets
 * the same component be driven purely by props (see the controlled overrides on the components).
 */
const useStateField = ({ statePath }: UseStateFieldArgs) => {
  const store = useOptionalFieldStateStore();
  const { getError, handleFieldChange } = useValidation();
  const scope = useOptionalValidationScope();

  const setStateValue = useCallback(
    (value: unknown): void => {
      const nextState = store?.setValue(statePath, value);
      if (scope && handleFieldChange) {
        handleFieldChange(scope.pageKey, scope.components, nextState as Submission | undefined);
      }
    },
    [store, statePath, scope, handleFieldChange],
  );

  return {
    stateValue: store?.getValue(statePath),
    error: scope && getError ? getError(statePath, scope.pageKey, scope.components) : undefined,
    setStateValue,
  };
};

export { useStateField };
export type { UseStateFieldArgs };
