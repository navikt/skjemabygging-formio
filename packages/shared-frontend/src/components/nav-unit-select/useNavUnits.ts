import { Enhetstype } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useOptionalNavUnitsContext } from './NavUnitsProvider';
import { filterNavUnits, resolveNavUnits } from './navUnitUtils';
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

  const { allUnits, error, retry } = shared && enabled ? shared : own;
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
