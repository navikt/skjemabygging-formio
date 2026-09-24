import { createContext, ReactNode, useContext } from 'react';
import type { RuntimeServices } from './RuntimeServices';

interface Props {
  children: ReactNode;
  services: RuntimeServices;
}

const RuntimeServicesContext = createContext<RuntimeServices | undefined>(undefined);

const RuntimeServicesProvider = ({ children, services }: Props) => (
  <RuntimeServicesContext.Provider value={services}>{children}</RuntimeServicesContext.Provider>
);

const useRuntimeServices = (): RuntimeServices => {
  const services = useContext(RuntimeServicesContext);
  if (!services) {
    throw new Error('Runtime services are required to render network-backed form components.');
  }
  return services;
};

export type * from './RuntimeServices';
export { RuntimeServicesProvider, useRuntimeServices };
