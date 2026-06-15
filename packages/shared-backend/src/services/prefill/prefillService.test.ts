import { describe, expect, it, vi } from 'vitest';
import { createPrefillService } from './prefillService';

describe('createPrefillService', () => {
  it('delegates getPrefillData with configured baseUrl', async () => {
    const client = {
      getPrefillData: vi.fn().mockResolvedValue({ sokerFornavn: 'Ada' }),
    };

    const service = createPrefillService({
      baseUrl: 'https://send-inn.test/fyllUt/v1/prefill-data',
      client,
    });

    const response = await service.getPrefillData({
      accessToken: 'tokenx-access-token',
      properties: 'sokerFornavn',
    });

    expect(response).toEqual({ sokerFornavn: 'Ada' });
    expect(client.getPrefillData).toHaveBeenCalledWith({
      accessToken: 'tokenx-access-token',
      baseUrl: 'https://send-inn.test/fyllUt/v1/prefill-data',
      properties: 'sokerFornavn',
    });
  });
});
