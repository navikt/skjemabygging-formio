import {
  FormsApiGlobalTranslation,
  PublishedTranslations,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { Mock, vi } from 'vitest';
import { fetchWithErrorHandling } from '../../fetchUtils';
import { createHeaders } from '../utils/formsApiUtils';
import createGlobalTranslationService from './GlobalTranslationsService';

vi.mock('../../fetchUtils', () => ({
  fetchWithErrorHandling: vi.fn(),
}));

vi.mock('../utils/formsApiUtils', () => ({
  createHeaders: vi.fn(),
}));

describe('GlobalTranslationsService', () => {
  const formsApiUrl = 'http://example.com';
  let globalTranslationService;
  const accessToken = 'test-token';
  const translation: FormsApiGlobalTranslation = { id: 1, key: 'Test', tag: 'skjematekster', nb: 'Test' };

  beforeEach(() => {
    vi.clearAllMocks();
    globalTranslationService = createGlobalTranslationService(formsApiUrl);
  });

  it('should get translations', async () => {
    const translations = [translation];
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: translations });

    const result = await globalTranslationService.get();

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(`${formsApiUrl}/v1/global-translations`, {
      headers: createHeaders(),
    });
    expect(result).toEqual(translations);
  });

  it('should post a new translation', async () => {
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: translation });

    const result = await globalTranslationService.post(translation, accessToken);

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(`${formsApiUrl}/v1/global-translations`, {
      method: 'POST',
      headers: createHeaders(accessToken),
      body: JSON.stringify(translation),
    });
    expect(result).toEqual(translation);
  });

  it('should update a translation', async () => {
    const updatedTranslation = { ...translation, nb: 'Updated Test' };
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: updatedTranslation });

    const result = await globalTranslationService.put(translation.id!.toString(), updatedTranslation, 1, accessToken);

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(`${formsApiUrl}/v1/global-translations/${translation.id}`, {
      method: 'PUT',
      headers: createHeaders(accessToken, 1),
      body: JSON.stringify(updatedTranslation),
    });
    expect(result).toEqual(updatedTranslation);
  });

  it('should delete a translation', async () => {
    (fetchWithErrorHandling as Mock).mockResolvedValue({ status: 'success' });

    await globalTranslationService.delete(translation.id!.toString(), accessToken);

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(`${formsApiUrl}/v1/global-translations/${translation.id}`, {
      method: 'DELETE',
      headers: createHeaders(accessToken),
    });
  });

  it('should get published translations', async () => {
    const publishedTranslations: PublishedTranslations = {
      publishedAt: '2025-02-12T08:37:25.083+01',
      publishedBy: 'Test testesen',
      translations: {
        nn: {},
        en: {},
      },
    };
    const languages: TranslationLang[] = ['nb', 'nn', 'en'];
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: publishedTranslations });

    const result = await globalTranslationService.getPublished(languages, accessToken);

    const searchParams = new URLSearchParams({ languageCodes: languages.toString() });
    expect(fetchWithErrorHandling).toHaveBeenCalledWith(
      `${formsApiUrl}/v1/published-global-translations?${searchParams}`,
      { headers: createHeaders(accessToken) },
    );
    expect(result).toEqual(publishedTranslations);
  });
});
