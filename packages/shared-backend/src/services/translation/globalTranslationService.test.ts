import { describe, expect, it, vi } from 'vitest';
import { createGlobalTranslationService, FormsSource } from './globalTranslationService';

const baseUrl = 'http://forms-api.example';

const setup = (formsSource: FormsSource) => {
  const client = { getGlobalTranslations: vi.fn(), getPublishedGlobalTranslations: vi.fn() };
  const service = createGlobalTranslationService({ baseUrl, formsSource, client });
  return { service, client };
};

describe('createGlobalTranslationService', () => {
  describe('formsapi-staging', () => {
    it('maps the latest translations for the language and skips missing ones', async () => {
      const { service, client } = setup('formsapi-staging');
      client.getGlobalTranslations.mockResolvedValue([
        { key: 'Ja', nb: 'Ja', en: 'Yes' },
        { key: 'Nei', nb: 'Nei' },
      ]);

      await expect(service.getGlobalTranslations('en')).resolves.toEqual({ Ja: { en: 'Yes' } });
      expect(client.getGlobalTranslations).toHaveBeenCalledWith({ baseUrl, languageCodes: ['en'], timeoutMs: 5000 });
      expect(client.getPublishedGlobalTranslations).not.toHaveBeenCalled();
    });

    it('fetches on every call so unpublished changes show up at once', async () => {
      const { service, client } = setup('formsapi-staging');
      client.getGlobalTranslations
        .mockResolvedValueOnce([{ key: 'Ja', en: 'Yes' }])
        .mockResolvedValueOnce([{ key: 'Ja', en: 'Yes!' }]);

      await service.getGlobalTranslations('en');

      await expect(service.getGlobalTranslations('en')).resolves.toEqual({ Ja: { en: 'Yes!' } });
    });

    it('propagates fetch failures', async () => {
      const { service, client } = setup('formsapi-staging');
      client.getGlobalTranslations.mockRejectedValue(new Error('forms-api down'));

      await expect(service.getGlobalTranslations('en')).rejects.toThrow('forms-api down');
    });
  });

  describe('formsapi-published', () => {
    it('reads from the published translations endpoint', async () => {
      const { service, client } = setup('formsapi-published');
      client.getPublishedGlobalTranslations.mockResolvedValue({});

      await service.getGlobalTranslations('en');

      expect(client.getPublishedGlobalTranslations).toHaveBeenCalled();
      expect(client.getGlobalTranslations).not.toHaveBeenCalled();
    });
  });
});
