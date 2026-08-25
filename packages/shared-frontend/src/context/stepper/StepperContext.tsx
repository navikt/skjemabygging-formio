import { createContext, ReactNode, useContext } from 'react';

const StepperContext = createContext<{ isOpen: boolean }>({ isOpen: false });

const StepperProvider = ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) => (
  <StepperContext.Provider value={{ isOpen }}>{children}</StepperContext.Provider>
);

const useStepperState = () => useContext(StepperContext);

export { StepperProvider, useStepperState };
