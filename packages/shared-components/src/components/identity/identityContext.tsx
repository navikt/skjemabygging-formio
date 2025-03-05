import { SubmissionIdentity } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext } from 'react';

interface IdentityContextType {
  onChange: (nationalIdentity: SubmissionIdentity) => void;
  nationalIdentity?: SubmissionIdentity;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
}

interface IdentityProviderProps extends IdentityContextType {
  children: React.ReactNode;
}

const AddressContext = createContext<IdentityContextType>({} as IdentityContextType);

export const IdentityProvider = ({
  children,
  onChange,
  nationalIdentity,
  readOnly,
  required,
  className,
}: IdentityProviderProps) => {
  return (
    <AddressContext.Provider value={{ onChange, nationalIdentity, readOnly, required, className }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useIdentity = () => useContext(AddressContext);
