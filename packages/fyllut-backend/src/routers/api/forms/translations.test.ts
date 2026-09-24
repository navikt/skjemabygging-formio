import { translationService } from '../../../services';
import { mockRequest, mockResponse } from '../../../test/testHelpers';
import translations from './translations';

vi.mock('../../../services', () => ({
  translationService: { getTranslations: vi.fn() },
}));

describe('form translations', () => {
  it('returns key-first translations from the shared translation service', async () => {
    const translationMap = {
      title: { nb: 'Tittel', nn: 'Tittel', en: 'Title' },
    };
    vi.mocked(translationService.getTranslations).mockResolvedValueOnce(translationMap);
    const request = mockRequest({ params: { formPath: 'nav123456' } });
    const response = mockResponse();

    await translations.get(request, response);

    expect(translationService.getTranslations).toHaveBeenCalledWith({ formPath: 'nav123456' });
    expect(response.json).toHaveBeenCalledWith(translationMap);
  });
});
