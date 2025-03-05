import { Form, FormPropertiesType } from '@navikt/skjemadigitalisering-shared-domain';
import { Mock, vi } from 'vitest';
import { fetchWithErrorHandling } from '../../fetchUtils';
import { createHeaders } from '../utils/formsApiUtils';
import createFormsService from './FormsService';

vi.mock('../../fetchUtils', () => ({
  fetchWithErrorHandling: vi.fn(),
}));

vi.mock('../utils/formsApiUtils', () => ({
  createHeaders: vi.fn(),
}));

describe('FormsService', () => {
  const formsApiUrl = 'http://example.com';
  let formsService;
  const accessToken = 'test-token';
  const form: Form = {
    properties: {} as FormPropertiesType,
    id: 1,
    path: 'test-form',
    title: 'Test Form',
    skjemanummer: 'NAV 123',
    components: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    formsService = createFormsService(formsApiUrl);
  });

  it('should get all forms', async () => {
    const forms = [form];
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: forms });

    const result = await formsService.getAll();

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(`${formsApiUrl}/v1/forms?`, { headers: createHeaders() });
    expect(result).toEqual(forms);
  });

  it('should get a form by path', async () => {
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: form });

    const result = await formsService.get(form.path);

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(`${formsApiUrl}/v1/forms/${form.path}`, {
      headers: createHeaders(),
    });
    expect(result).toEqual(form);
  });

  it('should post a new form', async () => {
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: form });

    const result = await formsService.post(form, accessToken);

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(`${formsApiUrl}/v1/forms`, {
      method: 'POST',
      headers: createHeaders(accessToken),
      body: JSON.stringify(form),
    });
    expect(result).toEqual(form);
  });

  it('should update a form', async () => {
    const updatedForm = { ...form, title: 'Updated Test Form' };
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: updatedForm });

    const result = await formsService.put(form.path, updatedForm, 1, accessToken);

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(`${formsApiUrl}/v1/forms/${form.path}`, {
      method: 'PUT',
      headers: createHeaders(accessToken, 1),
      body: JSON.stringify(updatedForm),
    });
    expect(result).toEqual(updatedForm);
  });

  it('should lock a form', async () => {
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: form });
    const reason = 'Den skal være låst';

    const result = await formsService.postLockForm(form.path, reason, accessToken);

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(`${formsApiUrl}/v1/forms/${form.path}/lock`, {
      method: 'POST',
      headers: createHeaders(accessToken),
      body: JSON.stringify({ reason }),
    });
    expect(result).toEqual(form);
  });

  it('should unlock a form', async () => {
    (fetchWithErrorHandling as Mock).mockResolvedValue({ data: form });

    const result = await formsService.deleteLockForm(form.path, accessToken);

    expect(fetchWithErrorHandling).toHaveBeenCalledWith(`${formsApiUrl}/v1/forms/${form.path}/lock`, {
      method: 'DELETE',
      headers: createHeaders(accessToken),
    });
    expect(result).toEqual(form);
  });
});
