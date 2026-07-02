import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApplicationService } from './applicationService';
import type { SubmitApplicationRequest, SubmitApplicationResponse } from './applicationTypes';

describe('createApplicationService', () => {
  const accessToken = 'tokenx-access-token';
  const baseUrl = 'https://send-inn.test';
  const correlationId = 'corr-123';
  const innsendingsId = '12345678-1234-1234-1234-12345678abcd';
  const attachmentId = 'attachment-1';
  const fileId = '12345678-1234-1234-1234-123456789abc';
  const paths = { soknad: '/fyllUt/v1/soknad', utfyltSoknad: '/fyllUt/v1/utfyltSoknad' };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles draft operations through the real service and client path', async () => {
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ innsendingsId }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ innsendingsId }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ updated: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 'OK' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    const service = createApplicationService({ baseUrl, paths });

    await expect(
      service.getSoknad<{ innsendingsId: string }>({ accessToken, correlationId, innsendingsId }),
    ).resolves.toEqual({
      innsendingsId,
    });
    await expect(
      service.createSoknad<{ innsendingsId: string }>({
        accessToken,
        correlationId,
        envQualifier: 'q2',
        innsendingsId,
        body: { formPath: 'nav123' },
      }),
    ).resolves.toEqual({
      status: 201,
      body: { innsendingsId },
    });
    await expect(
      service.updateSoknad<{ updated: boolean }>({
        accessToken,
        correlationId,
        innsendingsId,
        body: { formPath: 'nav123' },
      }),
    ).resolves.toEqual({ updated: true });
    await expect(
      service.deleteSoknad<{ status: string }>({ accessToken, correlationId, innsendingsId }),
    ).resolves.toEqual({
      status: 'OK',
    });

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      `${baseUrl}${paths.soknad}/${innsendingsId}`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'x-correlation-id': correlationId,
          'x-innsendingsid': innsendingsId,
        }),
      }),
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      `${baseUrl}${paths.soknad}`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Bearer ${accessToken}`,
          'Nav-Env-Qualifier': 'q2',
          'x-correlation-id': correlationId,
          'x-innsendingsid': innsendingsId,
        }),
      }),
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      3,
      `${baseUrl}${paths.soknad}/${innsendingsId}`,
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          Authorization: `Bearer ${accessToken}`,
          'x-correlation-id': correlationId,
          'x-innsendingsid': innsendingsId,
        }),
      }),
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      4,
      `${baseUrl}${paths.soknad}/${innsendingsId}`,
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: `Bearer ${accessToken}`,
          'x-correlation-id': correlationId,
          'x-innsendingsid': innsendingsId,
        }),
      }),
    );
  });

  it('returns manual redirect metadata for utfylt soknad submit', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: { Location: 'https://nav.no/location' },
      }),
    );
    const service = createApplicationService({ baseUrl, paths });

    await expect(
      service.submitUtfyltSoknad({
        accessToken,
        correlationId,
        envQualifier: 'q2',
        innsendingsId,
        body: { data: true },
      }),
    ).resolves.toEqual({
      status: 302,
      location: 'https://nav.no/location',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}${paths.utfyltSoknad}/${innsendingsId}`,
      expect.objectContaining({
        method: 'PUT',
        redirect: 'manual',
        headers: expect.objectContaining({
          Authorization: `Bearer ${accessToken}`,
          'Nav-Env-Qualifier': 'q2',
          'x-correlation-id': correlationId,
          'x-innsendingsid': innsendingsId,
        }),
      }),
    );
  });

  it('handles attachment operations and records upload metrics through the real service and client path', async () => {
    const startTimer = vi.fn().mockReturnValue(vi.fn());
    const observe = vi.fn();
    const stopTimer = vi.fn();
    startTimer.mockReturnValue(stopTimer);
    const stream = new ReadableStream<Uint8Array>({
      start: (controller) => {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        controller.close();
      },
    });
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: fileId, name: 'test.txt', size: 4 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 204,
        }),
      )
      .mockResolvedValueOnce(
        new Response(stream, {
          status: 200,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename="test.txt"',
            'Content-Length': '3',
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'upload failed' }), {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    const service = createApplicationService({
      baseUrl,
      paths,
      metrics: {
        uploadDuration: { startTimer } as any,
        uploadFileSize: { observe } as any,
      },
    });

    await service.uploadAttachment({
      accessToken,
      attachmentId,
      correlationId,
      fileBlob: new Blob(['test']),
      fileName: 'test.txt',
      innsendingsId,
      type: 'digital',
    });

    await expect(
      service.deleteAttachment({
        accessToken,
        attachmentId,
        correlationId,
        fileId,
        innsendingsId,
        type: 'digital',
      }),
    ).resolves.toBeUndefined();

    const downloadedAttachment = await service.downloadAttachment({
      accessToken,
      attachmentId,
      correlationId,
      fileId,
      innsendingsId,
      type: 'digital',
    });
    expect(downloadedAttachment.contentType).toBe('application/octet-stream');
    expect(downloadedAttachment.contentDisposition).toBe('attachment; filename="test.txt"');
    expect(downloadedAttachment.contentLength).toBe('3');
    expect(Buffer.from(await new Response(downloadedAttachment.body).arrayBuffer())).toEqual(Buffer.from([1, 2, 3]));

    await expect(
      service.uploadAttachment({
        accessToken,
        attachmentId,
        correlationId,
        fileBlob: new Blob(['test']),
        fileName: 'test.txt',
        innsendingsId,
        type: 'nologin',
      }),
    ).rejects.toBeInstanceOf(ResponseError);

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      `${baseUrl}/v1/application-digital/${innsendingsId}/attachments/${attachmentId}`,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      `${baseUrl}/v1/application-digital/${innsendingsId}/attachments/${attachmentId}/${fileId}`,
      expect.objectContaining({
        method: 'DELETE',
      }),
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      3,
      `${baseUrl}/v1/application-digital/${innsendingsId}/attachments/${attachmentId}/${fileId}`,
      expect.objectContaining({
        method: 'GET',
      }),
    );

    expect(startTimer).toHaveBeenNthCalledWith(1, { type: 'digital' });
    expect(startTimer).toHaveBeenNthCalledWith(2, { type: 'nologin' });
    expect(observe).toHaveBeenNthCalledWith(1, { type: 'digital', error: 'false' }, 4);
    expect(observe).toHaveBeenNthCalledWith(2, { type: 'nologin', error: 'true' }, 4);
    expect(stopTimer).toHaveBeenNthCalledWith(1, { error: 'false' });
    expect(stopTimer).toHaveBeenNthCalledWith(2, { error: 'true' });
  });

  it('submits application json through the real service and client path', async () => {
    const responseBody: SubmitApplicationResponse = {
      innsendingsId,
      submittedAt: '2024-01-01T00:00:00.000Z',
      title: 'Title',
      attachments: [],
    };
    const requestBody: SubmitApplicationRequest = {
      attachments: [],
      formNumber: 'NAV 12.34-56',
      language: 'nb',
      mainDocument: 'a',
      mainDocumentAlt: 'b',
      otherUploadAvailable: false,
      tema: 'BIL',
      title: 'Title',
    };
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const service = createApplicationService({ baseUrl, paths });

    await expect(
      service.submitApplication({
        accessToken,
        correlationId,
        body: requestBody,
        innsendingsId,
        type: 'digital',
      }),
    ).resolves.toEqual(responseBody);
  });

  it('guards invalid attachment file ids before calling fetch', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const service = createApplicationService({ baseUrl, paths });

    await expect(
      service.deleteAttachment({
        accessToken,
        attachmentId,
        fileId: 'not-a-uuid',
        innsendingsId,
        type: 'digital',
      }),
    ).rejects.toThrow('Invalid fileId provided for deletion');

    await expect(
      service.downloadAttachment({
        accessToken,
        attachmentId,
        fileId: 'not-a-uuid',
        innsendingsId,
        type: 'digital',
      }),
    ).rejects.toThrow('Invalid fileId provided for download');

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('normalizes sent-or-deleted draft errors through the real service and client path', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ errorCode: 'illegalAction.applicationSentInOrDeleted' }), {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const service = createApplicationService({ baseUrl, paths });

    await expect(
      service.getSoknad({
        accessToken,
        innsendingsId,
      }),
    ).rejects.toMatchObject({
      errorCode: 'NOT_FOUND',
    });
  });
});
