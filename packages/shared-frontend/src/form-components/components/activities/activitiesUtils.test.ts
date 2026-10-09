import { SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { getSelectedActivityId, mapActivities, toActivitiesLocale } from './activitiesUtils';

describe('activitiesUtils', () => {
  it('maps language to locale', () => {
    expect(toActivitiesLocale('nb')).toBe('nb-NO');
    expect(toActivitiesLocale('nn')).toBe('nn-NO');
    expect(toActivitiesLocale('en')).toBe('en-US');
  });

  it('maps activities to submission activities with localized text', () => {
    const activities: SendInnAktivitet[] = [
      {
        aktivitetId: 'a1',
        aktivitetstype: 'type',
        aktivitetsnavn: 'Arbeidstrening',
        periode: { fom: '2023-12-01', tom: '2024-04-06' },
        antallDagerPerUke: 0,
        prosentAktivitetsdeltakelse: 0,
        aktivitetsstatus: 'status',
        aktivitetsstatusnavn: 'Status',
        erStoenadsberettigetAktivitet: true,
        erUtdanningsaktivitet: false,
        arrangoer: 'Nav',
        saksinformasjon: { saksnummerArena: '1', sakstype: 'A', vedtaksinformasjon: [] },
      },
    ];

    expect(mapActivities(activities, 'nb')).toEqual([
      {
        aktivitetId: 'a1',
        periode: { fom: '2023-12-01', tom: '2024-04-06' },
        text: 'Arbeidstrening: 01. desember 2023 - 06. april 2024',
      },
    ]);
  });

  it('returns selected activity id from vedtaksId or aktivitetId', () => {
    expect(getSelectedActivityId({ aktivitetId: 'a1', text: 'x' })).toBe('a1');
    expect(getSelectedActivityId({ aktivitetId: 'a1', vedtaksId: 'v1', text: 'x' })).toBe('v1');
    expect(getSelectedActivityId(undefined)).toBe('');
  });
});
