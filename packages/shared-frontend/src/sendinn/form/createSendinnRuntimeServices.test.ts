import http from '../../app/http/http';
import { createSendinnRuntimeServices } from './createSendinnRuntimeServices';

describe('Sendinn cover-page runtime adapter', () => {
  const request = {
    formPath: 'example',
    language: 'en' as const,
    attachmentFilter: ['N1'],
    submission: { data: { navUnit: '0101' } },
  };
  const post = vi.fn();
  const service = createSendinnRuntimeServices({ baseUrl: '/sendinn', http: { ...http, post } });

  beforeEach(() => {
    post.mockReset();
  });

  it('posts the supplied canonical context and decodes the JSON PDF as an application/pdf Blob', async () => {
    const bytes = '%PDF-1.4\ncover page\n%%EOF';
    post.mockResolvedValue({ pdf: btoa(bytes) });
    const pdf = await service.coverPage.create(request);
    expect(post).toHaveBeenCalledWith('/sendinn/api/cover-page', request);
    expect(pdf.type).toBe('application/pdf');
    expect(await pdf.text()).toBe(bytes);
  });

  it.each([undefined, '', 'not base64!', btoa('not a PDF')])(
    'rejects unusable successful responses rather than downloading them (%s)',
    async (pdf) => {
      post.mockResolvedValue({ pdf });
      await expect(service.coverPage.create(request)).rejects.toThrow();
    },
  );

  it('preserves the original request failure for correlated recovery', async () => {
    const error = new http.ResponseError('SERVICE_UNAVAILABLE', 'Unavailable', 'example-correlation');
    post.mockRejectedValue(error);
    await expect(service.coverPage.create(request)).rejects.toBe(error);
  });
});
