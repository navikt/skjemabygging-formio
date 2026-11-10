import { Enhet, Enhetstype } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useState } from 'react';
import { useApplication } from '../../context/application/ApplicationContext';
import { useRuntimeServices } from '../../context/runtime-services/RuntimeServicesContext';
import { filterNavUnits, sortNavUnits } from './navUnitUtils';

interface UseNavUnitsOptions {
  enabled?: boolean;
  unitTypes?: Enhetstype[];
}

const useNavUnits = ({ enabled = true, unitTypes }: UseNavUnitsOptions = {}) => {
  const { logger } = useApplication();
  const { formData } = useRuntimeServices();
  const [result, setResult] = useState<{ source: typeof formData; units?: Enhet[]; error?: Error }>();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    void formData
      .getNavUnits()
      .then((units) => {
        if (!cancelled) {
          setResult({ source: formData, units: sortNavUnits(units) });
        }
      })
      .catch((fetchError) => {
        if (cancelled) {
          return;
        }

        const resolvedError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
        logger?.error?.('Failed to load NAV units', { error: resolvedError.message });
        setResult({ source: formData, error: resolvedError });
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, formData, logger]);

  const currentResult = enabled && result?.source === formData ? result : undefined;
  const allUnits = currentResult?.units;
  const error = currentResult?.error;
  const units = useMemo(() => (allUnits ? filterNavUnits(allUnits, unitTypes) : undefined), [allUnits, unitTypes]);

  return {
    allUnits,
    units,
    error,
    loading: enabled && allUnits === undefined && error === undefined,
  };
};

export { useNavUnits };
export type { UseNavUnitsOptions };
