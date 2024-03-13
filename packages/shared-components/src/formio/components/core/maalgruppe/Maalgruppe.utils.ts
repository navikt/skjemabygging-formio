import { SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';

type MaalgruppeMapValue = { priority: number; kodeverkVerdi: string };

const maalgruppeMap: Record<string, MaalgruppeMapValue> = {
  aapUforeNedsattArbEvne: { priority: 1, kodeverkVerdi: 'NEDSARBEVN' },
  ensligUtdanning: { priority: 2, kodeverkVerdi: 'ENSFORUTD' },
  ensligArbSoker: { priority: 3, kodeverkVerdi: 'ENSFORARBS' },
  tidligereFamiliepleier: { priority: 4, kodeverkVerdi: 'TIDLFAMPL' },
  gjenlevendeUtdanning: { priority: 5, kodeverkVerdi: 'GJENEKUTD' },
  gjenlevendeArbSoker: { priority: 6, kodeverkVerdi: 'GJENEKARBS' },
  tiltakspenger: { priority: 7, kodeverkVerdi: 'MOTTILTPEN' },
  dagpenger: { priority: 8, kodeverkVerdi: 'MOTDAGPEN' },
  regArbSoker: { priority: 9, kodeverkVerdi: 'ARBSOKERE' },
  annet: { priority: 10, kodeverkVerdi: 'ANNET' },
};

const flattenedData = (data: SubmissionData) =>
  Object.entries(data).reduce<SubmissionData>(
    (partialData, [key, value]) => ({
      ...partialData,
      ...(value && typeof value === 'object' ? value : { [key]: value }),
    }),
    {},
  );

const findSelectedMaalgruppe = (data: SubmissionData) =>
  Object.entries(flattenedData(data)).reduce<MaalgruppeMapValue | null>(
    (prevResult, [key, value]) =>
      (value === true || value === 'ja') &&
      maalgruppeMap[key] &&
      maalgruppeMap[key].priority < (prevResult?.priority || Infinity)
        ? maalgruppeMap[key]
        : prevResult,
    null,
  )?.kodeverkVerdi;

export { findSelectedMaalgruppe };
