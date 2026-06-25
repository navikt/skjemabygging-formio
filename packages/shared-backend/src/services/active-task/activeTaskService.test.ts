import { afterEach, describe, expect, it, vi } from 'vitest';
import { createActiveTaskService } from './activeTaskService';

describe('createActiveTaskService', () => {
  const accessToken = 'tokenx-access-token';
  const baseUrl = 'https://send-inn.test';

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gets and maps active tasks through the real service and client path', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            skjemanr: 'NAV123',
            innsendingsId: 'id-1',
            endretDato: '2024-01-01',
            soknadstype: 'soknad',
            extraField: 'ignored',
          },
        ]),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const service = createActiveTaskService({ baseUrl });

    await expect(service.getActiveTasks({ accessToken, skjemanummer: 'NAV123' })).resolves.toEqual([
      {
        skjemanr: 'NAV123',
        innsendingsId: 'id-1',
        endretDato: '2024-01-01',
        soknadstype: 'soknad',
      },
    ]);

    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/frontend/v1/skjema/NAV123/soknader?soknadstyper=soknad,ettersendelse`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'x-correlation-id': expect.any(String),
        }),
      }),
    );
  });

  it('gets activities unchanged through the real service and client path', async () => {
    const activities = [{ aktivitetId: '1', aktivitetsnavn: 'Aktivitet' }];
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(activities), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const service = createActiveTaskService({ baseUrl });

    await expect(service.getActivities({ accessToken, dagligreise: true, innsendingsId: 'abc-123' })).resolves.toEqual(
      activities,
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/fyllUt/v1/aktiviteter?dagligreise=true`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: `Bearer ${accessToken}`,
          'x-innsendingsid': 'abc-123',
          'x-correlation-id': expect.any(String),
        }),
      }),
    );
  });

  it('wraps activity response errors with the activities-specific message', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'upstream failed' }), {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': 'corr-123',
        },
      }),
    );

    const service = createActiveTaskService({ baseUrl });

    await expect(service.getActivities({ accessToken })).rejects.toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
      message: 'Feil ved kall til SendInn for aktiviteter',
      userMessage: 'Feil ved kall til SendInn for aktiviteter',
    });
  });
});
