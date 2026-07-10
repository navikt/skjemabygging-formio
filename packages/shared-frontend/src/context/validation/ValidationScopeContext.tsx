import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext } from 'react';

/**
 * The set of components that form the current validation unit (a wizard page in fyllut). Field
 * components read this from context instead of receiving it as props, so reusable components only
 * need a `statePath`. Other surfaces (static-pdf, bygger) can provide their own scope.
 */
interface ValidationScope {
  pageKey: string;
  components: Component[];
}

const ValidationScopeContext = createContext<ValidationScope | undefined>(undefined);

interface Props extends ValidationScope {
  children: ReactNode;
}

const ValidationScopeProvider = ({ pageKey, components, children }: Props) => (
  <ValidationScopeContext.Provider value={{ pageKey, components }}>{children}</ValidationScopeContext.Provider>
);

const useOptionalValidationScope = (): ValidationScope | undefined => useContext(ValidationScopeContext);

const useValidationScope = (): ValidationScope => {
  const scope = useContext(ValidationScopeContext);
  if (!scope) {
    throw new Error('useValidationScope must be used within a ValidationScopeProvider');
  }
  return scope;
};

export { useOptionalValidationScope, useValidationScope, ValidationScopeProvider };
export type { ValidationScope };
