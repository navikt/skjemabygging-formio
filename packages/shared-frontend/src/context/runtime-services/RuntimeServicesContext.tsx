import { createContext, ReactNode, useContext } from 'react';
import type { RuntimeServices } from './RuntimeServices';

type NavUnitRuntimeServices = { formData: Pick<RuntimeServices['formData'], 'getNavUnits'> };

interface Props {
  children: ReactNode;
  services: RuntimeServices | NavUnitRuntimeServices;
}

const RuntimeServicesContext = createContext<RuntimeServices | NavUnitRuntimeServices | undefined>(undefined);

const RuntimeServicesProvider = ({ children, services }: Props) => (
  <RuntimeServicesContext.Provider value={services}>{children}</RuntimeServicesContext.Provider>
);

const useRuntimeServices = (): RuntimeServices => {
  const services = useContext(RuntimeServicesContext);
  if (!services || !('applications' in services)) {
    throw new Error('Runtime services are required to render network-backed form components.');
  }
  return services;
};

const useNavUnitService = () => {
  const services = useContext(RuntimeServicesContext);
  if (!services) throw new Error('A Nav unit runtime service is required.');
  return services.formData;
};

export type * from './RuntimeServices';
export { RuntimeServicesProvider, useNavUnitService, useRuntimeServices };
export type { NavUnitRuntimeServices };
