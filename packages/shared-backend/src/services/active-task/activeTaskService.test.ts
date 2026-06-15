import { SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it, vi } from 'vitest';
import { createActiveTaskService } from './activeTaskService';

describe('createActiveTaskService', () => {
  it('projects active tasks to the public response shape', async () => {
    const client = {
      getActiveTasks: vi.fn().mockResolvedValue([
        {
          skjemanr: 'NAV123',
          innsendingsId: 'id-1',
          endretDato: '2024-01-01',
          soknadstype: 'soknad',
          extraField: 'ignored',
        },
      ]),
      getActivities: vi.fn(),
    };

    const service = createActiveTaskService({
      baseUrl: 'https://send-inn.test',
      activitiesPath: '/fyllUt/v1/aktiviteter',
      client,
    });

    await expect(service.getActiveTasks({ accessToken: 'token', skjemanummer: 'NAV123' })).resolves.toEqual([
      {
        skjemanr: 'NAV123',
        innsendingsId: 'id-1',
        endretDato: '2024-01-01',
        soknadstype: 'soknad',
      },
    ]);
  });

  it('returns activities unchanged', async () => {
    const activities = [
      {
        aktivitetId: '1',
        aktivitetstype: 'X',
        aktivitetsnavn: 'Aktivitet',
        periode: { fom: '2024-01-01', tom: '2024-01-31' },
        antallDagerPerUke: 5,
        prosentAktivitetsdeltakelse: 100,
        aktivitetsstatus: 'AKTIV',
        aktivitetsstatusnavn: 'Aktiv',
        erStoenadsberettigetAktivitet: true,
        erUtdanningsaktivitet: false,
        arrangoer: 'Nav',
        saksinformasjon: {
          saksnummerArena: 'A1',
          sakstype: 'TYPE',
          vedtaksinformasjon: [],
        },
      },
    ] as SendInnAktivitet[];
    const client = {
      getActiveTasks: vi.fn(),
      getActivities: vi.fn().mockResolvedValue(activities),
    };

    const service = createActiveTaskService({
      baseUrl: 'https://send-inn.test',
      activitiesPath: '/fyllUt/v1/aktiviteter',
      client,
    });

    await expect(service.getActivities({ accessToken: 'token' })).resolves.toBe(activities);
  });
});
