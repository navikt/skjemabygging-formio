import { afterEach, describe, expect, it, vi } from 'vitest';
import { applicationActivitiesService } from '../../../../services';
import { mockRequest, mockResponse } from '../../../../test/testHelpers';

vi.mock('../../../../services', () => ({
  applicationActivitiesService: {
    getActivities: vi.fn(),
  },
}));

import sendInnActivities from './send-inn-activities';

describe('[endpoint] send-inn/activities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards token, header and query to applicationActivitiesService', async () => {
    const result = [
      {
        aktivitetId: '1',
        aktivitetstype: 'TILTAK',
        aktivitetsnavn: 'Aktivitet',
        periode: {
          fom: '2024-01-01',
          tom: '2024-01-31',
        },
        antallDagerPerUke: 5,
        prosentAktivitetsdeltakelse: 100,
        aktivitetsstatus: 'AKTIV',
        aktivitetsstatusnavn: 'Aktiv',
        erStoenadsberettigetAktivitet: true,
        erUtdanningsaktivitet: false,
        arrangoer: 'Nav',
        saksinformasjon: {
          saksnummerArena: 'SAK-1',
          sakstype: 'TYPE',
          vedtaksinformasjon: [],
        },
      },
    ];
    vi.mocked(applicationActivitiesService.getActivities).mockResolvedValueOnce(result);

    const req = mockRequest({
      headers: {
        'x-innsendingsid': 'abc-123',
      },
      query: {
        dagligreise: 'true',
      },
    });
    req.getTokenxAccessToken = () => 'tokenx-token';
    const res = mockResponse();
    const next = vi.fn();

    await sendInnActivities.get(req, res, next);

    expect(applicationActivitiesService.getActivities).toHaveBeenCalledWith({
      accessToken: 'tokenx-token',
      dagligreise: true,
      innsendingsId: 'abc-123',
    });
    expect(res.json).toHaveBeenCalledWith(result);
    expect(next).not.toHaveBeenCalled();
  });
});
