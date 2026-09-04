import { createContext, ReactNode, useContext } from 'react';

/**
 * Generic, surface-agnostic state store used by reusable input components. A component binds to a
 * value by `statePath` and never knows which concrete store backs it. Fyllut provides the submission
 * store; other surfaces (e.g. a future static-pdf state) provide their own implementation. Reusable
 * components stay decoupled from any single store.
 */
interface FieldStateStore {
  getValue: (statePath: string) => unknown;
  /**
   * Apply `value` at `statePath` and return the next full state snapshot. The snapshot is opaque to
   * generic consumers; concrete surfaces (e.g. validation in fyllut) may narrow it to their own type.
   */
  setValue: (statePath: string, value: unknown) => unknown;
}

const StateContext = createContext<FieldStateStore | undefined>(undefined);

interface Props {
  store: FieldStateStore;
  children: ReactNode;
}

const StateStoreProvider = ({ store, children }: Props) => (
  <StateContext.Provider value={store}>{children}</StateContext.Provider>
);

// Optional on purpose: reusable components must not crash when no state store is present (e.g. when
// used fully controlled via props). Returns undefined when there is no provider.
const useOptionalFieldStateStore = (): FieldStateStore | undefined => useContext(StateContext);

export { StateStoreProvider, useOptionalFieldStateStore };
export type { FieldStateStore };
