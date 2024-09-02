import { Address } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext } from 'react';
import { AddressInputType } from './Address';

interface AddressContextType {
  onChange: (type: AddressInputType, value: string) => void;
  address?: Address;
  readOnly?: boolean;
  label?: string;
  className?: string;
  hideIfEmpty?: boolean;
}

interface AddressProviderProps extends AddressContextType {
  children: React.ReactNode;
}

const AddressContext = createContext<AddressContextType>({} as AddressContextType);

export const AddressProvider = ({
  children,
  onChange,
  address,
  readOnly,
  label,
  className,
  hideIfEmpty,
}: AddressProviderProps) => {
  return (
    <AddressContext.Provider value={{ onChange, address, readOnly, label, className, hideIfEmpty }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => useContext(AddressContext);
