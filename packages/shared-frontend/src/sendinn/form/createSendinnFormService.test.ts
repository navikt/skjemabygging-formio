import { createSendinnFormService } from './createSendinnFormService';

describe('Sendinn form host adapter', () => {
  it('uses the injected host HTTP client and keeps the normalized context in repeated query values', async () => {
    const result = { form: { path: 'nav123456' }, language: 'en' };
    const get = vi.fn().mockResolvedValue(result);
    const { loadForm } = createSendinnFormService({ baseUrl: '/host', http: { get } });

    await expect(
      loadForm({ formPath: 'nav123456', language: 'en', attachmentFilter: ['N2', 'N1', 'N2'] }),
    ).resolves.toBe(result);
    expect(get).toHaveBeenCalledWith('/host/api/forms/nav123456?lang=en&filter=N2&filter=N1&filter=N2');
  });
});
