import { NavFormType, PrefillData, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext, useEffect, useState } from 'react';
import http from '../../api/util/http/http';

interface PrefillDataContextType {
  prefillData: PrefillData | undefined;
}

interface PrefillDataProviderProps {
  children: React.ReactNode;
  form: NavFormType;
}

const PrefillDataContext = createContext<PrefillDataContextType>({} as PrefillDataContextType);

export const PrefillDataProvider = ({ children, form }: PrefillDataProviderProps) => {
  const [prefillData, setPrefillData] = useState<PrefillData>({});

  useEffect(() => {
    const loadPrefillData = async (navForm: NavFormType) => {
      const prefillComponents = navFormUtils.findComponentsByProperty('prefillKey', navForm);
      if (prefillComponents.length === 0) return null;

      const properties = prefillComponents.map((component) => component.prefillKey).join(',');

      const fyllutPrefillData = (await http.get(
        `/fyllut/api/send-inn/prefill-data?properties=${properties}`,
      )) as PrefillData;
      setPrefillData(fyllutPrefillData);
    };
    loadPrefillData(form);
  }, []);

  return <PrefillDataContext.Provider value={{ prefillData }}>{children}</PrefillDataContext.Provider>;
};

export const usePrefillData = () => useContext(PrefillDataContext);
