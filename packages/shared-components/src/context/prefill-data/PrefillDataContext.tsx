import { NavFormType, PrefillData, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAppConfig } from '../config/configContext';

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
  const { http, baseUrl, submissionMethod } = useAppConfig();

  useEffect(() => {
    const loadPrefillData = async (navForm: NavFormType) => {
      const prefillComponents = navFormUtils.findComponentsByProperty('prefillKey', navForm);
      // No need to fetch prefill data if there are no components with prefillKey
      if (prefillComponents.length === 0) return null;

      // No need to fetch prefill data if submission method is paper (currently not supported)
      if (submissionMethod === 'paper') return null;

      const properties = prefillComponents.map((component) => component.prefillKey);
      const uniqueProperties = [...new Set(properties)].join(',');

      const fyllutPrefillData = await http?.get<PrefillData>(
        `${baseUrl}/api/send-inn/prefill-data?properties=${uniqueProperties}`,
      );

      if (fyllutPrefillData) setPrefillData(fyllutPrefillData);
    };
    loadPrefillData(form);
  }, []);

  return <PrefillDataContext.Provider value={{ prefillData }}>{children}</PrefillDataContext.Provider>;
};

export const usePrefillData = () => useContext(PrefillDataContext);
