import { HttpResponseError } from '@navikt/skjemadigitalisering-shared-backend';
import { ResponseError, SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';
import { activeTaskService } from '../../../../services';
import { mockRequest, mockResponse } from '../../../../test/testHelpers';
import sendInnActivities from './send-inn-activities';

describe('[endpoint] send-inn/activities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns activities from the shared service', async () => {
    const activities = [
      {
        aktivitetId: '1',
        aktivitetstype: 'TILTAK',
        aktivitetsnavn: 'Tiltak',
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
    vi.spyOn(activeTaskService, 'getActivities').mockResolvedValue(activities);

    const req = mockRequest({
      headers: { 'x-innsendingsid': 'innsendings-id' },
      query: { dagligreise: 'true' },
    });
    req.getTokenxAccessToken = () => 'tokenx-access-token';
    const res = mockResponse();
    const next = vi.fn();

    await sendInnActivities.get(req, res, next);

    expect(activeTaskService.getActivities).toHaveBeenCalledWith({
      accessToken: 'tokenx-access-token',
      innsendingsId: 'innsendings-id',
      dagligreise: true,
    });
    expect(res.json).toHaveBeenCalledWith(activities);
    expect(next).not.toHaveBeenCalled();
  });

  it('wraps HttpResponseError with route-specific ResponseError', async () => {
    vi.spyOn(activeTaskService, 'getActivities').mockRejectedValue(
      new HttpResponseError('SERVICE_UNAVAILABLE', 'upstream failed', { detail: 'x' }, 'ignored user message'),
    );

    const req = mockRequest({});
    req.getTokenxAccessToken = () => 'tokenx-access-token';
    const res = mockResponse();
    const next = vi.fn();

    await sendInnActivities.get(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ResponseError);
    expect(error).toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
      message: 'Feil ved kall til SendInn for aktiviteter',
      userMessage: 'Feil ved kall til SendInn for aktiviteter',
    });
  });

  it('passes non-http errors to next unchanged', async () => {
    const error = new Error('boom');
    vi.spyOn(activeTaskService, 'getActivities').mockRejectedValue(error);

    const req = mockRequest({});
    req.getTokenxAccessToken = () => 'tokenx-access-token';
    const res = mockResponse();
    const next = vi.fn();

    await sendInnActivities.get(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
