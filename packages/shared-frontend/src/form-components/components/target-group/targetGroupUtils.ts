import {
  SendInnMaalgruppe as SendInnTargetGroup,
  SubmissionData,
  SubmissionMaalgruppe as SubmissionTargetGroup,
} from '@navikt/skjemadigitalisering-shared-domain';

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
  submissionData: SubmissionData,
  currentValue?: SubmissionTargetGroup,
  prefilledValue?: SendInnTargetGroup,
): SubmissionTargetGroup => ({
  calculated: { maalgruppetype: findSelectedTargetGroup(submissionData) ?? 'ANNET' },
  prefilled: currentValue?.prefilled ?? prefilledValue,
});

const targetGroupValuesEqual = (left?: SubmissionTargetGroup, right?: SubmissionTargetGroup) =>
  JSON.stringify(left) === JSON.stringify(right);

const isSendInnTargetGroup = (value: unknown): value is SendInnTargetGroup =>
  typeof value === 'object' && value !== null && 'maalgruppetype' in value;

export { calculateTargetGroupValue, findSelectedTargetGroup, isSendInnTargetGroup, targetGroupValuesEqual };
