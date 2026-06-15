import { describe, expect, it, vi } from 'vitest';
import { createApplicationService } from './applicationService';

describe('createApplicationService', () => {
  it('delegates draft requests with baseUrl and paths', async () => {
    const client = {
      getSoknad: vi.fn().mockResolvedValue({ innsendingsId: 'id-1' }),
      createSoknad: vi.fn().mockResolvedValue({ status: 201, body: { innsendingsId: 'id-1' } }),
      updateSoknad: vi.fn().mockResolvedValue({ innsendingsId: 'id-1' }),
      deleteSoknad: vi.fn().mockResolvedValue({ status: 'OK' }),
      submitUtfyltSoknad: vi.fn(),
      uploadAttachment: vi.fn(),
      deleteAttachment: vi.fn(),
      downloadAttachment: vi.fn(),
      submitApplication: vi.fn(),
    };
    const service = createApplicationService({
      baseUrl: 'https://send-inn.test',
      paths: { soknad: '/fyllUt/v1/soknad', utfyltSoknad: '/fyllUt/v1/utfyltSoknad' },
      client,
    });

    await service.getSoknad({ accessToken: 'token', innsendingsId: 'id-1' });
    await service.createSoknad({ accessToken: 'token', innsendingsId: 'id-1', body: { formPath: 'nav123' } });
    await service.updateSoknad({ accessToken: 'token', innsendingsId: 'id-1', body: { formPath: 'nav123' } });
    await service.deleteSoknad({ accessToken: 'token', innsendingsId: 'id-1' });

    expect(client.getSoknad).toHaveBeenCalledWith({
      accessToken: 'token',
      baseUrl: 'https://send-inn.test',
      innsendingsId: 'id-1',
      paths: { soknad: '/fyllUt/v1/soknad', utfyltSoknad: '/fyllUt/v1/utfyltSoknad' },
    });
    expect(client.createSoknad).toHaveBeenCalledWith({
      accessToken: 'token',
      baseUrl: 'https://send-inn.test',
      body: { formPath: 'nav123' },
      innsendingsId: 'id-1',
      paths: { soknad: '/fyllUt/v1/soknad', utfyltSoknad: '/fyllUt/v1/utfyltSoknad' },
    });
    expect(client.updateSoknad).toHaveBeenCalledWith({
      accessToken: 'token',
      baseUrl: 'https://send-inn.test',
      body: { formPath: 'nav123' },
      innsendingsId: 'id-1',
      paths: { soknad: '/fyllUt/v1/soknad', utfyltSoknad: '/fyllUt/v1/utfyltSoknad' },
    });
    expect(client.deleteSoknad).toHaveBeenCalledWith({
      accessToken: 'token',
      baseUrl: 'https://send-inn.test',
      innsendingsId: 'id-1',
      paths: { soknad: '/fyllUt/v1/soknad', utfyltSoknad: '/fyllUt/v1/utfyltSoknad' },
    });
  });

  it('records upload metrics on success and failure', async () => {
    const startTimer = vi.fn().mockReturnValue(vi.fn());
    const observe = vi.fn();
    const client = {
      getSoknad: vi.fn(),
      createSoknad: vi.fn(),
      updateSoknad: vi.fn(),
      deleteSoknad: vi.fn(),
      submitUtfyltSoknad: vi.fn(),
      uploadAttachment: vi
        .fn()
        .mockResolvedValueOnce({
          fileId: 'file-1',
          attachmentId: 'att-1',
          innsendingId: 'id-1',
          fileName: 'a.pdf',
          size: 4,
        })
        .mockRejectedValueOnce(new Error('upload failed')),
      deleteAttachment: vi.fn(),
      downloadAttachment: vi.fn(),
      submitApplication: vi.fn(),
    };
    const service = createApplicationService({
      baseUrl: 'https://send-inn.test',
      paths: { soknad: '/fyllUt/v1/soknad', utfyltSoknad: '/fyllUt/v1/utfyltSoknad' },
      client,
      metrics: {
        uploadDuration: { startTimer } as any,
        uploadFileSize: { observe } as any,
      },
    });

    await service.uploadAttachment({
      accessToken: 'token',
      attachmentId: 'att-1',
      fileBlob: new Blob(['test']),
      fileName: 'a.pdf',
      innsendingsId: 'id-1',
      type: 'digital',
    });

    await expect(
      service.uploadAttachment({
        accessToken: 'token',
        attachmentId: 'att-1',
        fileBlob: new Blob(['test']),
        fileName: 'a.pdf',
        innsendingsId: 'id-1',
        type: 'nologin',
      }),
    ).rejects.toThrow('upload failed');

    expect(startTimer).toHaveBeenNthCalledWith(1, { type: 'digital' });
    expect(startTimer).toHaveBeenNthCalledWith(2, { type: 'nologin' });
    expect(observe).toHaveBeenNthCalledWith(1, { type: 'digital', error: 'false' }, 4);
    expect(observe).toHaveBeenNthCalledWith(2, { type: 'nologin', error: 'true' }, 4);
  });
});
