import { createContext, ReactNode, useContext, useMemo } from 'react';

const StepperContext = createContext<{ isOpen: boolean }>({ isOpen: false });

const StepperProvider = ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) => {
  const value = useMemo(() => ({ isOpen }), [isOpen]);
  return <StepperContext.Provider value={value}>{children}</StepperContext.Provider>;
};

const useStepperState = () => useContext(StepperContext);

export { StepperProvider, useStepperState };
