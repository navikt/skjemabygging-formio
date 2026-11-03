import { SendInnMaalgruppe as SendInnTargetGroup } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { calculateTargetGroupValue, findSelectedTargetGroup } from './targetGroupUtils';

describe('InputTargetGroup helpers', () => {
  const prefilled: SendInnTargetGroup = {
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

  it('replaces a saved prefilled value with the latest prefill', () => {
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
      prefilled,
    });
  });

  it('keeps the saved prefilled value when there is no current prefill', () => {
    const saved = { maalgruppetype: 'MOTDAGPEN' };

    expect(calculateTargetGroupValue({}, { calculated: { maalgruppetype: 'ANNET' }, prefilled: saved })).toEqual({
      calculated: { maalgruppetype: 'ANNET' },
      prefilled: saved,
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
