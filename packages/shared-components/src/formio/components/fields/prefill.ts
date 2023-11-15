import { PrefillType } from '@navikt/skjemadigitalisering-shared-domain';

export const prefill = {
  type: 'select',
  input: true,
  label: 'Preutfylling',
  key: 'prefill',
  dataSrc: 'values',
  required: false,
  data: {
    values: Object.keys(PrefillType).map((key) => ({ value: key, label: PrefillType[key] })),
  },
  weight: 1,
};
