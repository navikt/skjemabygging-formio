import { Address, FieldSize } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext } from 'react';
import { SubmissionAddressType } from './Address';

interface AddressContextType {
  onChange: (type: SubmissionAddressType, value: string) => void;
  address?: Address;
  readOnly?: boolean;
  required?: boolean;
  label?: string;
  className?: string;
  fieldSize?: FieldSize;
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
  required,
  label,
  className,
  fieldSize,
}: AddressProviderProps) => {
  return (
    <AddressContext.Provider value={{ onChange, address, readOnly, required, label, className, fieldSize }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => useContext(AddressContext);
