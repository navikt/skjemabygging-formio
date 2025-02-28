import { Form, PublishedTranslations, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { Mock, vi } from 'vitest';
import { fetchWithErrorHandling } from '../../fetchUtils';
import { createHeaders } from '../utils/formsApiUtils';
import createFormPublicationsService from './FormPublicationsService';

vi.mock('../../fetchUtils', () => ({
  fetchWithErrorHandling: vi.fn(),
}));

vi.mock('../utils/formsApiUtils', () => ({
  createHeaders: vi.fn(),
}));

describe('FormPublicationsService', () => {
  const formsApiUrl = 'http://example.com';
  let formPublicationsService;
  const accessToken = 'test-token';
  const form: Form = { path: 'test-form', title: 'Test Form' } as Form;
  const languages: TranslationLang[] = ['nb'];
  const publishedTranslations: PublishedTranslations = {
    publishedAt: '2025-02-12T08:37:25.083+01',
    publishedBy: 'Test testesen',
    translations: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    formPublicationsService = createFormPublicationsService(formsApiUrl);
  });

  it('should get all forms', async () => {
    const forms = [form];
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: forms });

    const result = await formPublicationsService.getAll();

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(`${formsApiUrl}/v1/form-publications`, {
      headers: createHeaders(),
    });
    expect(result).toEqual(forms);
  });

  it('should get a form by path', async () => {
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: form });

    const result = await formPublicationsService.get(form.path);

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(`${formsApiUrl}/v1/form-publications/${form.path}`, {
      headers: createHeaders(),
    });
    expect(result).toEqual(form);
  });

  it('should post a new form publication', async () => {
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: form });

    const result = await formPublicationsService.post(form.path, languages, 1, accessToken);

    const searchParams = new URLSearchParams({ languageCodes: languages.toString() });
    expect(fetchWithErrorHandling).toHaveBeenCalledWith(
      `${formsApiUrl}/v1/form-publications/${form.path}?${searchParams}`,
      {
        method: 'POST',
        headers: createHeaders(accessToken, 1),
      },
    );
    expect(result).toEqual(form);
  });

  it('should unpublish a form', async () => {
    (fetchWithErrorHandling as Mock).mockResolvedValue({});

    await formPublicationsService.unpublish(form.path, accessToken);

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(`${formsApiUrl}/v1/form-publications/${form.path}`, {
      method: 'DELETE',
      headers: createHeaders(accessToken),
    });
  });

  it('should get translations for a form', async () => {
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: publishedTranslations });

    const result = await formPublicationsService.getTranslations(form.path, languages);

    const searchParams = new URLSearchParams({ languageCodes: languages.toString() });
    expect(fetchWithErrorHandling).toHaveBeenCalledWith(
      `${formsApiUrl}/v1/form-publications/${form.path}/translations?${searchParams}`,
      {
        headers: createHeaders(),
      },
    );
    expect(result).toEqual(publishedTranslations);
  });
});
