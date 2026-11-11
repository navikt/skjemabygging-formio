import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { NavUnitsState, useNavUnitsLoader } from './useNavUnitsLoader';

interface NavUnitsContextValue extends NavUnitsState {
  request: () => void;
}

const NavUnitsContext = createContext<NavUnitsContextValue | undefined>(undefined);
NavUnitsContext.displayName = 'NavUnitsContext';

// Shares one Nav unit lookup between every input and summary below it. The lookup starts when the first component asks for units.
const NavUnitsProvider = ({ children }: { children: ReactNode }) => {
  const [requested, setRequested] = useState(false);
  const { allUnits, error, loading, retry } = useNavUnitsLoader(requested);
  const request = useCallback(() => setRequested(true), []);
  const value = useMemo(
    () => ({ allUnits, error, loading, retry, request }),
    [allUnits, error, loading, retry, request],
  );

  return <NavUnitsContext.Provider value={value}>{children}</NavUnitsContext.Provider>;
};

const useOptionalNavUnitsContext = () => useContext(NavUnitsContext);

export { NavUnitsProvider, useOptionalNavUnitsContext };
