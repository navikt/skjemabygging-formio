import { SendInnMaalgruppe, SubmissionData, SubmissionMaalgruppe } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useStateField } from '../../../context/state/useStateField';
import { TargetGroupDefinition } from '../../component-types';
import { InputComponentProps, resolveSubmissionPath } from '../../inputComponentRegistryUtils';

type TargetGroupMapValue = { priority: number; code: string };

const targetGroupMap: Record<string, TargetGroupMapValue> = {
  aapUforeNedsattArbEvne: { priority: 1, code: 'NEDSARBEVN' },
  ensligUtdanning: { priority: 2, code: 'ENSFORUTD' },
  ensligArbSoker: { priority: 3, code: 'ENSFORARBS' },
  tidligereFamiliepleier: { priority: 4, code: 'TIDLFAMPL' },
  gjenlevendeUtdanning: { priority: 5, code: 'GJENEKUTD' },
  gjenlevendeArbSoker: { priority: 6, code: 'GJENEKARBS' },
  tiltakspenger: { priority: 7, code: 'MOTTILTPEN' },
  dagpenger: { priority: 8, code: 'MOTDAGPEN' },
  regArbSoker: { priority: 9, code: 'ARBSOKERE' },
  annet: { priority: 10, code: 'ANNET' },
};

const flattenData = (data: SubmissionData = {}) =>
  Object.entries(data).reduce<SubmissionData>(
    (partialData, [key, value]) => ({
      ...partialData,
      ...(value && typeof value === 'object' && !Array.isArray(value) ? value : { [key]: value }),
    }),
    {},
  );

const findSelectedTargetGroup = (data: SubmissionData = {}) =>
  Object.entries(flattenData(data)).reduce<TargetGroupMapValue | null>(
    (previous, [key, value]) =>
      (value === true || value === 'ja') &&
      targetGroupMap[key] &&
      targetGroupMap[key].priority < (previous?.priority ?? Number.POSITIVE_INFINITY)
        ? targetGroupMap[key]
        : previous,
    null,
  )?.code;

const calculateTargetGroupValue = (
  submissionData: object,
  currentValue?: SubmissionMaalgruppe,
  prefilledValue?: SendInnMaalgruppe,
): SubmissionMaalgruppe => ({
  calculated: { maalgruppetype: findSelectedTargetGroup(submissionData as SubmissionData) ?? 'ANNET' },
  prefilled: currentValue?.prefilled ?? prefilledValue,
});

const targetGroupValuesEqual = (left?: SubmissionMaalgruppe, right?: SubmissionMaalgruppe) =>
  JSON.stringify(left) === JSON.stringify(right);

const isSendInnTargetGroup = (value: unknown): value is SendInnMaalgruppe =>
  typeof value === 'object' && value !== null && 'maalgruppetype' in value;

const InputTargetGroup = ({ component, submissionPath }: InputComponentProps<TargetGroupDefinition>) => {
  const statePath = resolveSubmissionPath(component, submissionPath);
  const { submission } = useSubmissionState();
  const { stateValue, setStateValue } = useStateField({ statePath });
  const currentValue = stateValue as SubmissionMaalgruppe | undefined;
  const prefilledValue = isSendInnTargetGroup(component.prefillValue) ? component.prefillValue : undefined;
  const nextValue = useMemo(
    () => calculateTargetGroupValue(submission?.data ?? {}, currentValue, prefilledValue),
    [currentValue, prefilledValue, submission?.data],
  );

  useEffect(() => {
    if (!targetGroupValuesEqual(currentValue, nextValue)) {
      setStateValue(nextValue);
    }
  }, [currentValue, nextValue, setStateValue]);

  return null;
};

export default InputTargetGroup;
export { calculateTargetGroupValue, findSelectedTargetGroup, targetGroupValuesEqual };
