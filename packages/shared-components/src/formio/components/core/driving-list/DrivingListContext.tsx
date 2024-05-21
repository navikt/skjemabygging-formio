import { DrivingListSubmission, DrivingListValues } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext } from 'react';

interface DrivingListContextContextType {
  values: DrivingListSubmission;
  updateValues: (value: DrivingListValues) => void;
  getComponentError: (elementId: string) => string | undefined;
}

interface DrivingListProviderProps extends DrivingListContextContextType {
  children: React.ReactNode;
}

const DrivingListContext = createContext<DrivingListContextContextType>({} as DrivingListContextContextType);

export const DrivingListProvider = ({ children, ...props }: DrivingListProviderProps) => {
  return <DrivingListContext.Provider value={props}>{children}</DrivingListContext.Provider>;
};

export const useDrivingList = () => useContext(DrivingListContext);
