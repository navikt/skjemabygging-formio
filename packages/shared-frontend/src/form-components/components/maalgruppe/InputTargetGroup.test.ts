import { SendInnMaalgruppe } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { calculateTargetGroupValue, findSelectedTargetGroup } from './InputTargetGroup';

describe('InputTargetGroup helpers', () => {
  const prefilled: SendInnMaalgruppe = {
    maalgruppetype: 'NEDSARBEVN',
    maalgruppenavn: 'Person med nedsatt arbeidsevne pga. sykdom',
    gyldighetsperiode: { fom: '2024-01-01', tom: '2025-01-01' },
  };

  it('returns ANNET when nothing relevant is selected', () => {
    expect(calculateTargetGroupValue({ aktivitet: {} }, undefined, prefilled)).toEqual({
      calculated: { maalgruppetype: 'ANNET' },
      prefilled,
    });
  });

  it('keeps existing prefilled value instead of overwriting it', () => {
    expect(
      calculateTargetGroupValue(
        {},
        {
          calculated: { maalgruppetype: 'ANNET' },
          prefilled: { maalgruppetype: 'MOTDAGPEN' },
        },
        prefilled,
      ),
    ).toEqual({
      calculated: { maalgruppetype: 'ANNET' },
      prefilled: { maalgruppetype: 'MOTDAGPEN' },
    });
  });

  it('selects target group by priority', () => {
    expect(
      calculateTargetGroupValue({
        ensligUtdanning: true,
        gjenlevendeUtdanning: true,
        dagpenger: true,
        annet: true,
      }),
    ).toEqual({
      calculated: { maalgruppetype: 'ENSFORUTD' },
      prefilled: undefined,
    });
  });

  it('accepts true and ja, but not other truthy values', () => {
    expect(
      findSelectedTargetGroup({
        aapUforeNedsattArbEvne: 'qwerty',
        ensligUtdanning: 'ja',
        ensligArbSoker: true,
      }),
    ).toBe('ENSFORUTD');
  });
});
