import nock from 'nock';
import { config } from '../../config/config';
import ApplicationClient from './ApplicationClient';

vi.mock('../../services', () => ({
  appMetrics: {
    innsendingApiUploadDuration: {
      startTimer: () => () => undefined,
    },
    innsendingApiUploadFileSize: {
      observe: () => undefined,
    },
  },
}));

const { sendInnConfig } = config;

describe('ApplicationClient', () => {
  const client = ApplicationClient(config, 'digital');
  const innsendingsId = '12345678-1234-1234-1234-12345678abcd';
  const attachmentId = 'eiajfi8';
  const fileId = '12345678-1234-1234-1234-123456789abc';
  const accessToken = 'tokenx-access-token-for-unittest';

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  describe('downloadFile', () => {
    it('returns attachment stream and headers on success', async () => {
      const fileContent = Buffer.from('attachment-content');
      const sendInnNockScope = nock(sendInnConfig.host)
        .get(`/v1/application-digital/${innsendingsId}/attachments/${attachmentId}/${fileId}`)
        .matchHeader('authorization', `Bearer ${accessToken}`)
        .matchHeader('x-innsendingsid', innsendingsId)
        .reply(200, fileContent, {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': 'attachment; filename="test.txt"',
          'Content-Length': String(fileContent.length),
        });

      const result = await client.downloadFile(accessToken, innsendingsId, attachmentId, fileId);
      const downloadedContent = Buffer.from(await new Response(result.fileStream).arrayBuffer());

      expect(downloadedContent).toEqual(fileContent);
      expect(result.contentType).toContain('application/octet-stream');
      expect(result.contentDisposition).toBe('attachment; filename="test.txt"');
      expect(result.contentLength).toBe(String(fileContent.length));
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it('throws HttpError when upstream response is not ok', async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .get(`/v1/application-digital/${innsendingsId}/attachments/${attachmentId}/${fileId}`)
        .reply(500, { message: 'download failed' }, { 'Content-Type': 'application/json' });

      await expect(client.downloadFile(accessToken, innsendingsId, attachmentId, fileId)).rejects.toMatchObject({
        message: 'Feil ved nedlasting av fil',
        functional: true,
        http_response_body: { message: 'download failed' },
        http_status: 500,
      });

      expect(sendInnNockScope.isDone()).toBe(true);
    });
  });
});
