import { describe, expect, it, vi } from 'vitest';
import { createRegisterDataService } from './registerDataService';

describe('registerDataService', () => {
  it('maps Tilleggsstonader activities to shared-domain Activity[]', async () => {
    const client = {
      getActivities: vi.fn().mockResolvedValue([
        { id: 'A1', tekst: 'Aktivitet 1', type: 'TILTAK' },
        { id: 'A2', tekst: 'Aktivitet 2', type: 'UTDANNING' },
      ]),
    };

    const service = createRegisterDataService({
      baseUrl: 'http://tilleggsstonader',
      client,
    });

    await expect(
      service.getActivities({
        accessToken: 'tokenx-token',
        query: { dagligreise: 'true' },
      }),
    ).resolves.toEqual([
      { value: 'A1', label: 'Aktivitet 1', type: 'TILTAK' },
      { value: 'A2', label: 'Aktivitet 2', type: 'UTDANNING' },
    ]);

    expect(client.getActivities).toHaveBeenCalledWith({
      baseUrl: 'http://tilleggsstonader',
      accessToken: 'tokenx-token',
      query: { dagligreise: 'true' },
    });
  });
});
