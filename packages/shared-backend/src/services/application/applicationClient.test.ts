import { afterEach, describe, expect, it, vi } from 'vitest';
import applicationClient from './applicationClient';
import type { SubmitApplicationRequest, SubmitApplicationResponse } from './applicationTypes';

describe('applicationClient', () => {
  const accessToken = 'tokenx-access-token';
  const baseUrl = 'https://send-inn.test';
  const correlationId = 'corr-123';
  const innsendingsId = '12345678-1234-1234-1234-12345678abcd';
  const attachmentId = 'attachment-1';
  const fileId = '12345678-1234-1234-1234-123456789abc';

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gets draft application json', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ innsendingsId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await applicationClient.getSoknad<{ innsendingsId: string }>({
      accessToken,
      baseUrl,
      correlationId,
      innsendingsId,
      paths: { soknad: '/fyllUt/v1/soknad', utfyltSoknad: '/fyllUt/v1/utfyltSoknad' },
    });

    expect(response).toEqual({ innsendingsId });
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/fyllUt/v1/soknad/${innsendingsId}`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: `Bearer ${accessToken}`,
          'x-correlation-id': correlationId,
          'x-innsendingsid': innsendingsId,
        }),
      }),
    );
  });

  it('creates draft application and preserves response status', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ innsendingsId }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await applicationClient.createSoknad<{ innsendingsId: string }>({
      accessToken,
      baseUrl,
      body: { formPath: 'nav123' },
      envQualifier: 'q2',
      innsendingsId,
      paths: { soknad: '/fyllUt/v1/soknad', utfyltSoknad: '/fyllUt/v1/utfyltSoknad' },
    });

    expect(response).toEqual({
      status: 201,
      body: { innsendingsId },
    });
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/fyllUt/v1/soknad`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Nav-Env-Qualifier': 'q2',
        }),
      }),
    );
  });

  it('returns manual redirect response for utfylt soknad submit', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: { Location: 'https://nav.no/location' },
      }),
    );

    const response = await applicationClient.submitUtfyltSoknad({
      accessToken,
      baseUrl,
      body: { data: true },
      innsendingsId,
      paths: { soknad: '/fyllUt/v1/soknad', utfyltSoknad: '/fyllUt/v1/utfyltSoknad' },
    });

    expect(response).toEqual({
      status: 302,
      location: 'https://nav.no/location',
    });
  });

  it('uploads attachment as multipart form data', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: fileId, name: 'test.txt', size: 4 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await applicationClient.uploadAttachment({
      accessToken,
      attachmentId,
      baseUrl,
      fileBlob: new Blob(['test']),
      fileName: 'test.txt',
      innsendingsId,
      type: 'digital',
    });

    expect(response).toEqual({
      fileId,
      attachmentId,
      innsendingId: innsendingsId,
      fileName: 'test.txt',
      size: 4,
    });
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/v1/application-digital/${innsendingsId}/attachments/${attachmentId}`,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );
  });

  it('downloads attachment stream with headers', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start: (controller) => {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        controller.close();
      },
    });
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': 'attachment; filename="test.txt"',
          'Content-Length': '3',
        },
      }),
    );

    const response = await applicationClient.downloadAttachment({
      accessToken,
      attachmentId,
      baseUrl,
      fileId,
      innsendingsId,
      type: 'digital',
    });

    expect(response.contentType).toBe('application/octet-stream');
    expect(response.contentDisposition).toBe('attachment; filename="test.txt"');
    expect(response.contentLength).toBe('3');
    expect(Buffer.from(await new Response(response.body).arrayBuffer())).toEqual(Buffer.from([1, 2, 3]));
  });

  it('submits application json', async () => {
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

    const response = await applicationClient.submitApplication({
      accessToken,
      baseUrl,
      body: requestBody,
      innsendingsId,
      type: 'digital',
    });

    expect(response).toEqual(responseBody);
  });

  it('normalizes application sent-or-deleted errors to not found', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ errorCode: 'illegalAction.applicationSentInOrDeleted' }), {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(
      applicationClient.getSoknad({
        accessToken,
        baseUrl,
        innsendingsId,
        paths: { soknad: '/fyllUt/v1/soknad', utfyltSoknad: '/fyllUt/v1/utfyltSoknad' },
      }),
    ).rejects.toMatchObject({
      errorCode: 'NOT_FOUND',
    });
  });
});
