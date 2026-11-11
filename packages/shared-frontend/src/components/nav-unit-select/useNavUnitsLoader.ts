import { Enhet } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import { useApplication } from '../../context/application/ApplicationContext';
import { useCommonRuntimeServices } from '../../context/runtime-services/RuntimeServicesContext';
import { sortNavUnits } from './navUnitUtils';

interface NavUnitsState {
  allUnits?: Enhet[];
  error?: Error;
  loading: boolean;
  retry: () => void;
}

const useNavUnitsLoader = (enabled: boolean): NavUnitsState => {
  const { logger } = useApplication();
  const { formData } = useCommonRuntimeServices();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ source: typeof formData; attempt: number; units?: Enhet[]; error?: Error }>();
  // Keeps the previous error until the new attempt settles, so the retry button stays in place while it loads.
  const retry = useCallback(() => setAttempt((previous) => previous + 1), []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    void formData
      .getNavUnits()
      .then((units) => {
        if (!cancelled) {
          setResult({ source: formData, attempt, units: sortNavUnits(units) });
        }
      })
      .catch((fetchError) => {
        if (cancelled) {
          return;
        }

        const resolvedError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
        logger?.error?.('Failed to load Nav units');
        setResult({ source: formData, attempt, error: resolvedError });
      });

    return () => {
      cancelled = true;
    };
  }, [attempt, enabled, formData, logger]);

  const currentResult = enabled && result?.source === formData ? result : undefined;
  return {
    allUnits: currentResult?.units,
    error: currentResult?.error,
    loading: enabled && currentResult?.attempt !== attempt,
    retry,
  };
};

export { useNavUnitsLoader };
export type { NavUnitsState };
