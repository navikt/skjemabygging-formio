import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { createSendinnRuntimeServices } from './createSendinnRuntimeServices';

describe('Sendinn cover-page runtime adapter', () => {
  const request = {
    formPath: 'example',
    revision: 3,
    language: 'en' as const,
    attachmentFilter: ['N1'],
    submission: { data: { navUnit: '0101' } },
  };
  const get = vi.fn();
  const post = vi.fn();
  const service = createSendinnRuntimeServices({ baseUrl: '/sendinn', http: { get, post } });

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
    const error = new ResponseError('SERVICE_UNAVAILABLE', 'Unavailable', 'example-correlation');
    post.mockRejectedValue(error);
    await expect(service.coverPage.create(request)).rejects.toBe(error);
  });
});
