import { SendInnMaalgruppe, SubmissionData, SubmissionMaalgruppe } from '@navikt/skjemadigitalisering-shared-domain';
import HiddenComputedField from '../../../components/hidden-computed-field/HiddenComputedField';
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

const InputTargetGroup = ({ component, submissionPath }: InputComponentProps) => (
  <HiddenComputedField<SubmissionMaalgruppe>
    statePath={resolveSubmissionPath(component, submissionPath)}
    computeValue={({ submissionData, currentValue }) =>
      calculateTargetGroupValue(submissionData, currentValue, component.prefillValue as SendInnMaalgruppe | undefined)
    }
    equals={targetGroupValuesEqual}
  />
);

export default InputTargetGroup;
export { calculateTargetGroupValue, findSelectedTargetGroup, targetGroupValuesEqual };
