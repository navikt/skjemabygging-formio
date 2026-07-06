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
});
