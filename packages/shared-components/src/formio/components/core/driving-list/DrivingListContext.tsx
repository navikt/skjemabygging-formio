import { DrivingListSubmission, DrivingListValues } from '@navikt/skjemadigitalisering-shared-domain';
import { TFunction } from 'i18next';
import { createContext, useContext } from 'react';
import { AppConfigContextType } from '../../../../context/config/configContext';

interface DrivingListContextContextType {
  updateValues: (value: DrivingListValues) => void;
  appConfig: AppConfigContextType;
  values: DrivingListSubmission;
  t: TFunction;
  locale: string;
  getComponentError: (elementId: string) => string | undefined;
  addRef: (name: string, ref: HTMLElement | null) => void;
}

interface DrivingListProviderProps extends DrivingListContextContextType {
  children: React.ReactNode;
}

const DrivingListContext = createContext<DrivingListContextContextType>({} as DrivingListContextContextType);

export const DrivingListProvider = ({ children, ...props }: DrivingListProviderProps) => {
  return <DrivingListContext.Provider value={props}>{children}</DrivingListContext.Provider>;
};

export const useDrivingList = () => useContext(DrivingListContext);
