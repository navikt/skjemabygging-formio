import { createContext, ReactNode, useContext } from 'react';
import type { CommonRuntimeServices, FyllutRuntimeServices, SendinnRuntimeServices } from './RuntimeServices';

type HostRuntimeServices = FyllutRuntimeServices | SendinnRuntimeServices;

interface Props {
  children: ReactNode;
  services: HostRuntimeServices;
}

const RuntimeServicesContext = createContext<HostRuntimeServices | undefined>(undefined);
RuntimeServicesContext.displayName = 'RuntimeServicesContext';

const RuntimeServicesProvider = ({ children, services }: Props) => (
  <RuntimeServicesContext.Provider value={services}>{children}</RuntimeServicesContext.Provider>
);

const useRuntimeServices = (): FyllutRuntimeServices => {
  const services = useContext(RuntimeServicesContext);
  if (services?.host !== 'fyllut') {
    throw new Error('Runtime services are required to render network-backed form components.');
  }
  return services;
};

const useCommonRuntimeServices = (): CommonRuntimeServices => {
  const services = useContext(RuntimeServicesContext);
  if (!services) throw new Error('Runtime services are required to render network-backed form components.');
  return services;
};

export type * from './RuntimeServices';
export { RuntimeServicesProvider, useCommonRuntimeServices, useRuntimeServices };
