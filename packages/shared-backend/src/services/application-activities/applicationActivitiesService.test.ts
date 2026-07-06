import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApplicationActivitiesService } from './applicationActivitiesService';

describe('createApplicationActivitiesService', () => {
  const accessToken = 'tokenx-access-token';
  const baseUrl = 'https://send-inn.test';

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gets activities unchanged through the real service and client path', async () => {
    const activities = [{ aktivitetId: '1', aktivitetsnavn: 'Aktivitet' }];
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(activities), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const service = createApplicationActivitiesService({ baseUrl });

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

    const service = createApplicationActivitiesService({ baseUrl });

    await expect(service.getActivities({ accessToken })).rejects.toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
      message: 'Feil ved henting av aktiviteter',
      userMessage: 'Feil ved henting av aktiviteter',
    });
  });
});
