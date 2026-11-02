import { Enhet, Enhetstype } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApplication } from '../../context/application/ApplicationContext';
import { useNavUnitService } from '../../context/runtime-services/RuntimeServicesContext';
import { filterNavUnits, resolveNavUnits, sortNavUnits } from './navUnitUtils';

interface UseNavUnitsOptions {
  enabled?: boolean;
  unitTypes?: Enhetstype[];
}

const useNavUnits = ({ enabled = true, unitTypes }: UseNavUnitsOptions = {}) => {
  const { logger } = useApplication();
  const formData = useNavUnitService();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ source: typeof formData; units?: Enhet[]; error?: Error }>();
  const retry = useCallback(() => {
    setResult(undefined);
    setAttempt((previous) => previous + 1);
  }, []);

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
        logger?.error?.('Failed to load Nav units');
        setResult({ source: formData, error: resolvedError });
      });

    return () => {
      cancelled = true;
    };
  }, [attempt, enabled, formData, logger]);

  const currentResult = enabled && result?.source === formData ? result : undefined;
  const allUnits = currentResult?.units;
  const error = currentResult?.error;
  const units = useMemo(() => (allUnits ? filterNavUnits(allUnits, unitTypes) : undefined), [allUnits, unitTypes]);
  const availableUnits = useMemo(
    () => (allUnits ? resolveNavUnits(allUnits, unitTypes) : undefined),
    [allUnits, unitTypes],
  );

  return {
    allUnits,
    units,
    availableUnits,
    error,
    retry,
    loading: enabled && allUnits === undefined && error === undefined,
  };
};

export { useNavUnits };
export type { UseNavUnitsOptions };
