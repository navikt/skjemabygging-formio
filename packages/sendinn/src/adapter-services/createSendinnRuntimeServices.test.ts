import { createSendinnRuntimeServices } from './createSendinnRuntimeServices';

describe('Sendinn cover-page runtime adapter', () => {
  it('decodes the base64 PDF as an application/pdf Blob', async () => {
    const bytes = '%PDF-1.4\ncover page\n%%EOF';
    const post = vi.fn().mockResolvedValue({ pdfBase64: btoa(bytes) });
    const service = createSendinnRuntimeServices({ baseUrl: '/sendinn', http: { get: vi.fn(), post } });

    const pdf = await service.coverPage.create({
      formPath: 'example',
      revision: 3,
      language: 'en',
      attachmentFilter: [],
      submission: { data: {} },
    });

    expect(pdf.type).toBe('application/pdf');
    expect(await pdf.text()).toBe(bytes);
  });
});
