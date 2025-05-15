import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { Mock, vi } from 'vitest';
import { fetchWithErrorHandling } from '../../fetchUtils';
import { createHeaders } from '../utils/formsApiUtils';
import createFormTranslationsService from './FormTranslationService';

vi.mock('../../fetchUtils', () => ({
  fetchWithErrorHandling: vi.fn(),
}));

vi.mock('../utils/formsApiUtils', () => ({
  createHeaders: vi.fn(),
}));

describe('FormTranslationService', () => {
  const formsApiUrl = 'http://example.com';
  let formTranslationsService;
  const formPath = 'test-form';
  const accessToken = 'test-token';
  const translation: FormsApiTranslation = { id: 1, key: 'test', nb: 'Test' };

  beforeEach(() => {
    vi.clearAllMocks();
    formTranslationsService = createFormTranslationsService(formsApiUrl);
  });

  it('should get translations', async () => {
    const translations = [translation];
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: translations });

    const result = await formTranslationsService.get(formPath);

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(`${formsApiUrl}/v1/forms/${formPath}/translations`, {
      headers: createHeaders(),
    });
    expect(result).toEqual(translations);
  });

  it('should post a new translation', async () => {
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: translation });

    const result = await formTranslationsService.post(formPath, translation, accessToken);

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(`${formsApiUrl}/v1/forms/${formPath}/translations`, {
      method: 'POST',
      headers: createHeaders(accessToken),
      body: JSON.stringify(translation),
    });
    expect(result).toEqual(translation);
  });

  it('should update a translation', async () => {
    const updatedTranslation = { ...translation, value: 'Updated Test' };
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: updatedTranslation });

    const result = await formTranslationsService.put(
      formPath,
      translation.id?.toString(),
      updatedTranslation,
      1,
      accessToken,
    );

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(
      `${formsApiUrl}/v1/forms/${formPath}/translations/${translation.id}`,
      {
        method: 'PUT',
        headers: createHeaders(accessToken, 1),
        body: JSON.stringify(updatedTranslation),
      },
    );
    expect(result).toEqual(updatedTranslation);
  });

  it('should delete a translation', async () => {
    (fetchWithErrorHandling as Mock).mockResolvedValue({ status: 'success' });

    const result = await formTranslationsService.delete(formPath, translation.id, accessToken);

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(
      `${formsApiUrl}/v1/forms/${formPath}/translations/${translation.id}`,
      {
        method: 'DELETE',
        headers: createHeaders(accessToken),
      },
    );
    expect(result).toEqual('success');
  });
});
