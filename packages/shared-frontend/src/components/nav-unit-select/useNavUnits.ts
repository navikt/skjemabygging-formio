import { Enhetstype, navUnitUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useOptionalNavUnitsContext } from './NavUnitsProvider';
import { useNavUnitsLoader } from './useNavUnitsLoader';

interface UseNavUnitsOptions {
  enabled?: boolean;
  unitTypes?: Enhetstype[];
}

const useNavUnits = ({ enabled = true, unitTypes }: UseNavUnitsOptions = {}) => {
  const shared = useOptionalNavUnitsContext();
  const own = useNavUnitsLoader(enabled && !shared);
  const request = shared?.request;
  useEffect(() => {
    if (enabled) request?.();
  }, [enabled, request]);

  const { allUnits, error, loading, retry } = shared && enabled ? shared : own;
  const units = useMemo(
    () => (allUnits ? navUnitUtils.filterNavUnits(allUnits, unitTypes) : undefined),
    [allUnits, unitTypes],
  );
  const availableUnits = useMemo(
    () => (allUnits ? navUnitUtils.resolveNavUnits(allUnits, unitTypes) : undefined),
    [allUnits, unitTypes],
  );

  return {
    allUnits,
    units,
    availableUnits,
    error,
    retry,
    // A shared lookup that has not been requested yet still counts as loading.
    loading: enabled && (loading || (allUnits === undefined && error === undefined)),
  };
};

export { useNavUnits };
export type { UseNavUnitsOptions };
