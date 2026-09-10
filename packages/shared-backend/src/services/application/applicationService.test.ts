import { ResponseError, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../../shared/logger/logger';
import { createApplicationService } from './applicationService';
import type {
  SubmitApplicationRequest,
  SubmitApplicationResponse,
  SubsequentSubmissionReceipt,
  SubsequentSubmissionTask,
} from './applicationTypes';

describe('createApplicationService', () => {
  const accessToken = 'tokenx-access-token';
  const baseUrl = 'https://send-inn.test';
  const correlationId = 'corr-123';
  const innsendingsId = '12345678-1234-1234-1234-12345678abcd';
  const attachmentId = 'attachment-1';
  const fileId = '12345678-1234-1234-1234-123456789abc';
  const draftPath = '/fyllUt/v1/soknad';
  const submittedDraftPath = '/fyllUt/v1/utfyltSoknad';
  const submitLogMeta = {
    fyllutRequestPath: '/api/send-inn/digital-application/12345678-1234-1234-1234-12345678abcd',
    innsendingsId,
    language: 'nb',
    skjemanummer: 'NAV 12.34-56',
  };

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
    const service = createApplicationService({ baseUrl });

    await expect(
      service.getApplication<{ innsendingsId: string }>({ accessToken, correlationId, innsendingsId }),
    ).resolves.toEqual({
      innsendingsId,
    });
    await expect(
      service.createApplication<{ innsendingsId: string }>({
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
      service.updateApplication<{ updated: boolean }>({
        accessToken,
        correlationId,
        innsendingsId,
        body: { formPath: 'nav123' },
      }),
    ).resolves.toEqual({ updated: true });
    await expect(
      service.deleteApplication<{ status: string }>({ accessToken, correlationId, innsendingsId }),
    ).resolves.toEqual({
      status: 'OK',
    });

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      `${baseUrl}${draftPath}/${innsendingsId}`,
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
      `${baseUrl}${draftPath}`,
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
      `${baseUrl}${draftPath}/${innsendingsId}`,
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
      `${baseUrl}${draftPath}/${innsendingsId}`,
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
    const service = createApplicationService({ baseUrl });

    await expect(
      service.submitCompletedApplication({
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
      `${baseUrl}${submittedDraftPath}/${innsendingsId}`,
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
    ).rejects.toEqual(
      new ResponseError(
        'SERVICE_UNAVAILABLE',
        'upload failed',
        undefined,
        TEXTS.statiske.nologin.temporarilyUnavailable,
      ),
    );

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

  it('uses the digital attachment resource for subsequent submissions', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: fileId, name: 'test.txt', size: 4 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const service = createApplicationService({ baseUrl });

    await service.uploadAttachment({
      accessToken,
      attachmentId,
      fileBlob: new Blob(['test']),
      fileName: 'test.txt',
      innsendingsId,
      type: 'digital',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/v1/application-digital/${innsendingsId}/attachments/${attachmentId}`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('normalizes upload attachment too-many-pages errors in shared-backend', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ errorCode: 'illegalAction.fileWithTooManyPages' }), {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'Content-Type': 'application/json', 'x-correlation-id': correlationId },
      }),
    );
    const service = createApplicationService({ baseUrl });

    await expect(
      service.uploadAttachment({
        accessToken,
        attachmentId,
        correlationId,
        fileBlob: new Blob(['test']),
        fileName: 'test.txt',
        innsendingsId,
        type: 'digital',
      }),
    ).rejects.toEqual(
      new ResponseError(
        'FILE_TOO_MANY_PAGES',
        'Upload failed because file has too many pages',
        correlationId,
        TEXTS.statiske.uploadFile.uploadFileToManyPagesError,
      ),
    );
  });

  it('normalizes upload attachment temporarily unavailable errors in shared-backend', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ errorCode: 'temporarilyUnavailable', message: 'NOLOGIN is not available' }), {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json', 'x-correlation-id': correlationId },
      }),
    );
    const service = createApplicationService({ baseUrl });

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
    ).rejects.toEqual(
      new ResponseError(
        'SERVICE_UNAVAILABLE',
        'NOLOGIN is not available',
        correlationId,
        TEXTS.statiske.nologin.temporarilyUnavailable,
      ),
    );
  });

  it('submits application json through the real service and client path', async () => {
    const infoSpy = vi.spyOn(logger, 'info');
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
    const service = createApplicationService({ baseUrl });

    await expect(
      service.submitApplication({
        accessToken,
        correlationId,
        body: requestBody,
        innsendingsId,
        logMeta: submitLogMeta,
        type: 'digital',
      }),
    ).resolves.toEqual(responseBody);

    expect(infoSpy).toHaveBeenCalledWith(`${innsendingsId}: Submitting digital application`, {
      ...submitLogMeta,
      correlationId,
      targetUrl: `${baseUrl}/v1/application-digital/${innsendingsId}`,
    });
    expect(infoSpy).toHaveBeenCalledWith(`${innsendingsId}: Successfully submitted digital application`, submitLogMeta);
  });

  it('guards invalid attachment file ids before calling fetch', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const service = createApplicationService({ baseUrl });

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

  it('normalizes temporarily unavailable application submit errors', async () => {
    const warnSpy = vi.spyOn(logger, 'warn');
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ errorCode: 'temporarilyUnavailable', message: 'NOLOGIN is not available' }), {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json', 'x-correlation-id': correlationId },
      }),
    );
    const service = createApplicationService({ baseUrl });

    await expect(
      service.submitApplication({
        accessToken,
        correlationId,
        body: {
          attachments: [],
          formNumber: 'NAV 12.34-56',
          language: 'nb',
          mainDocument: 'a',
          mainDocumentAlt: 'b',
          otherUploadAvailable: false,
          tema: 'BIL',
          title: 'Title',
        },
        innsendingsId,
        logMeta: submitLogMeta,
        type: 'nologin',
      }),
    ).rejects.toEqual(
      new ResponseError(
        'SERVICE_UNAVAILABLE',
        'NOLOGIN is not available',
        correlationId,
        TEXTS.statiske.nologin.temporarilyUnavailable,
      ),
    );

    expect(warnSpy).toHaveBeenCalledWith(`${innsendingsId}: Failed to submit nologin application`, {
      ...submitLogMeta,
      correlationId,
      errorCode: 'SERVICE_UNAVAILABLE',
      errorMessage: 'NOLOGIN is not available',
      httpResponseStatus: 503,
      targetUrl: `${baseUrl}/v1/application-nologin/${innsendingsId}`,
    });
  });

  it('normalizes sent-or-deleted draft errors through the real service and client path', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ errorCode: 'illegalAction.applicationSentInOrDeleted' }), {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const service = createApplicationService({ baseUrl });

    await expect(
      service.getApplication({
        accessToken,
        innsendingsId,
      }),
    ).rejects.toMatchObject({
      errorCode: 'NOT_FOUND',
    });
  });

  it('gets an existing subsequent submission task through the digital application resource', async () => {
    const task: SubsequentSubmissionTask = {
      innsendingsId,
      revision: 'revision-1',
      formNumber: 'NAV 12.34-56',
      title: 'Additional documentation',
      tema: 'BIL',
      language: 'nb',
      otherUploadAvailable: true,
      attachments: [],
    };
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(task), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const service = createApplicationService({ baseUrl });

    await expect(
      service.getSubsequentSubmissionTask({ accessToken, correlationId, innsendingsId, type: 'digital' }),
    ).resolves.toEqual(task);
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/v1/application-digital/${innsendingsId}`,
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
  });

  it('supports no-login subsequent submission tasks', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          innsendingsId,
          revision: 'revision-1',
          formNumber: 'NAV 12.34-56',
          title: 'Additional documentation',
          tema: 'BIL',
          language: 'nb',
          otherUploadAvailable: true,
          attachments: [],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
    const service = createApplicationService({ baseUrl });

    await service.getSubsequentSubmissionTask({ accessToken, innsendingsId, type: 'nologin' });

    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/v1/application-nologin/${innsendingsId}`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('submits an existing subsequent submission task through the digital application resource', async () => {
    const receipt: SubsequentSubmissionReceipt = {
      innsendingsId,
      submittedAt: '2026-09-10T10:00:00Z',
      title: 'Additional documentation',
      submittedNow: [{ attachmentId, title: 'Documentation' }],
      submittedEarlier: [],
      outstanding: [],
    };
    const body = {
      revision: 'revision-1',
      mainDocument: 'main-document',
      mainDocumentAlt: 'main-document-alt',
      attachments: [],
    };
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(receipt), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const service = createApplicationService({ baseUrl });

    await expect(
      service.submitApplication({ accessToken, correlationId, innsendingsId, body, type: 'digital' }),
    ).resolves.toEqual(receipt);
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/v1/application-digital/${innsendingsId}`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify(body) }),
    );
  });
});
