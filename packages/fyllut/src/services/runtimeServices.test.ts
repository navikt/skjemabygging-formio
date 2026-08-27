import { FyllutHttp, FyllutHttpHeaders } from '@navikt/skjemadigitalisering-shared-frontend';
import { describe, expect, it } from 'vitest';
import createAttachmentService from './createAttachmentService';
import createSessionService from './createSessionService';
import createSubmissionService from './createSubmissionService';

interface Request {
  method: string;
  url: string;
  body?: object;
  headers?: FyllutHttpHeaders;
}

describe('fyllut runtime services', () => {
  it('keeps session, attachment, and submission transport details in the host', async () => {
    const requests: Request[] = [];
    const downloadedFile = new Blob(['content']);
    const http: FyllutHttp = {
      get: async <T>(url: string, headers?: FyllutHttpHeaders) => {
        requests.push({ method: 'GET', url, headers });
        return downloadedFile as T;
      },
      post: async <T>(url: string, body: object, headers?: FyllutHttpHeaders) => {
        requests.push({ method: 'POST', url, body, headers });
        return (
          url.endsWith('/captcha')
            ? { access_token: 'token-123' }
            : url.includes('/documents/')
              ? downloadedFile
              : { pdfBase64: 'pdf', receipt: { title: 'Receipt' } }
        ) as T;
      },
      put: async <T>() => undefined as T,
      delete: async <T>(url: string, body?: object, headers?: FyllutHttpHeaders) => {
        requests.push({ method: 'DELETE', url, body, headers });
        return undefined as T;
      },
      postFile: async <T>(url: string, body: FormData, headers?: FyllutHttpHeaders) => {
        requests.push({ method: 'POST_FILE', url, body, headers });
        return { attachmentId: 'attachment-1', fileId: 'file-1' } as T;
      },
      MimeType: { PDF: 'application/pdf' },
      isAuthenticationError: (error) => error === 'unauthorized',
    };
    const sessionService = createSessionService({ http, backendBaseUrl: '/fyllut' });
    const attachmentService = createAttachmentService({ http, backendBaseUrl: '/fyllut' });
    const submissionService = createSubmissionService({
      http,
      backendBaseUrl: '/fyllut',
      createPdf: async (url, body) => {
        requests.push({ method: 'POST_PDF', url, body });
        return downloadedFile;
      },
    });
    const application = { type: 'noLogin' as const, token: 'token-123' };
    const file = new File(['content'], 'document.txt');

    await expect(sessionService.createNoLoginToken()).resolves.toBe('token-123');
    expect(sessionService.isAuthenticationError('unauthorized')).toBe(true);
    await attachmentService.uploadFile({ application, attachmentId: 'attachment-1', file });
    await attachmentService.downloadFile({ application, attachmentId: 'attachment-1', fileId: 'file-1' });
    await attachmentService.deleteFile({ application, attachmentId: 'attachment-1', fileId: 'file-1' });
    await attachmentService.deleteAllFilesForAttachment({ application, attachmentId: 'attachment-1' });
    await attachmentService.deleteAllFiles(application);
    await submissionService.submit({
      application,
      formPath: 'test-form',
      submission: { data: {} },
      language: 'nb',
      submissionMethod: 'digitalnologin',
    });
    await submissionService.createDocument({
      documentType: 'application-with-cover-page',
      formPath: 'test-form',
      submission: { data: {} },
      language: 'nb',
      submissionMethod: 'paper',
      navUnitNumber: '1234',
    });

    expect(requests.map(({ method, url, headers }) => ({ method, url, headers }))).toEqual([
      { method: 'POST', url: '/fyllut/api/captcha', headers: undefined },
      {
        method: 'POST_FILE',
        url: '/fyllut/api/send-inn/nologin-application/attachments/attachment-1',
        headers: { NologinToken: 'token-123' },
      },
      {
        method: 'GET',
        url: '/fyllut/api/send-inn/nologin-application/attachments/attachment-1/file-1',
        headers: { NologinToken: 'token-123' },
      },
      {
        method: 'DELETE',
        url: '/fyllut/api/send-inn/nologin-application/attachments/attachment-1/file-1',
        headers: { NologinToken: 'token-123' },
      },
      {
        method: 'DELETE',
        url: '/fyllut/api/send-inn/nologin-application/attachments/attachment-1',
        headers: { NologinToken: 'token-123' },
      },
      {
        method: 'DELETE',
        url: '/fyllut/api/send-inn/nologin-application',
        headers: { NologinToken: 'token-123' },
      },
      {
        method: 'POST',
        url: '/fyllut/api/send-inn/nologin-application',
        headers: { NologinToken: 'token-123' },
      },
      {
        method: 'POST_PDF',
        url: '/fyllut/api/documents/cover-page-and-application',
        headers: undefined,
      },
    ]);
    expect(requests[1]?.body).toBeInstanceOf(FormData);
  });
});
