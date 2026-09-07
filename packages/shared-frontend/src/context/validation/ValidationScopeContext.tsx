import { createContext, MutableRefObject, ReactNode, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { useValidation } from './ValidationContext';

/**
 * The current validation unit (a wizard page in fyllut). Field components read it from context
 * instead of receiving it as props, so reusable components only need a `statePath`. Other surfaces
 * (static-pdf, bygger) can provide their own scope.
 *
 * `active` is false while the scope itself is unmounting, which is how fields tell "this page is
 * being left" (keep the registrations, the summary page validates every page) apart from "this
 * field is gone" (drop the registration). Render one scope instance per page, e.g. by keying the
 * provider on `pageKey`.
 */
interface ValidationScope {
  pageKey: string;
  active: MutableRefObject<boolean>;
}

const ValidationScopeContext = createContext<ValidationScope | undefined>(undefined);

interface Props {
  pageKey: string;
  children: ReactNode;
}

const ValidationScopeProvider = ({ pageKey, children }: Props) => {
  const { resetPageFields } = useValidation();
  const active = useRef(true);
  const scope = useMemo(() => ({ pageKey, active }), [pageKey]);

  useLayoutEffect(() => {
    active.current = true;
    // Registrations from an earlier visit may be stale (a condition elsewhere in the form can have
    // changed which fields this page renders), so the page rebuilds them while mounting.
    resetPageFields(pageKey);
    return () => {
      active.current = false;
    };
  }, [pageKey, resetPageFields]);

  return <ValidationScopeContext.Provider value={scope}>{children}</ValidationScopeContext.Provider>;
};

/**
 * Renders its children outside any validation scope: the inputs inside register nothing and look up
 * no error. It is for controls that display a value validated somewhere else - a value the form
 * calculates, or an answer whose rule its owner declares with `ValidationRegistration` - and those
 * controls receive the error to show as a prop. Everything else registers the field it renders.
 */
const UnvalidatedFields = ({ children }: { children: ReactNode }) => (
  <ValidationScopeContext.Provider value={undefined}>{children}</ValidationScopeContext.Provider>
);

const useOptionalValidationScope = (): ValidationScope | undefined => useContext(ValidationScopeContext);

const useValidationScope = (): ValidationScope => {
  const scope = useContext(ValidationScopeContext);
  if (!scope) {
    throw new Error('useValidationScope must be used within a ValidationScopeProvider');
  }
  return scope;
};

export { UnvalidatedFields, useOptionalValidationScope, useValidationScope, ValidationScopeProvider };
export type { ValidationScope };
