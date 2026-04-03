import { applicationService } from '../../../../../services';
import { mockRequest, mockResponse } from '../../../../../test/testHelpers';

const pipelineMock = vi.hoisted(() => vi.fn());
vi.mock('node:stream/promises', () => ({
  pipeline: pipelineMock,
}));

import attachmentsEndpoints from './attachments';

describe('[endpoint] send-inn/application/digital/attachments', () => {
  const innsendingsId = '12345678-1234-1234-1234-12345678abcd';
  const attachmentId = 'eiajfi8';
  const fileId = '12345678-1234-1234-1234-123456789abc';
  const accessToken = 'tokenx-access-token-for-unittest';

  afterEach(() => {
    vi.restoreAllMocks();
    pipelineMock.mockReset();
  });

  describe('GET', () => {
    it('streams file content with status 200 on success', async () => {
      const fileStream = new ReadableStream({
        start: (controller) => {
          controller.enqueue(Buffer.from('attachment-content'));
          controller.close();
        },
      });
      const downloadSpy = vi.spyOn(applicationService, 'downloadFile').mockResolvedValue({
        fileStream,
        contentType: 'application/octet-stream',
        contentDisposition: 'attachment; filename="test.txt"',
        contentLength: '18',
      });

      const req = mockRequest({
        params: { innsendingsId, attachmentId, fileId },
      });
      req.getTokenxAccessToken = () => accessToken;
      const res = mockResponse() as ReturnType<typeof mockResponse> & { setHeader: ReturnType<typeof vi.fn> };
      res.status.mockReturnValue(res);
      res.setHeader = vi.fn();
      const next = vi.fn();

      await attachmentsEndpoints.get(req, res, next);

      expect(downloadSpy).toHaveBeenCalledWith(accessToken, innsendingsId, attachmentId, fileId, 'digital');
      expect(res.contentType).toHaveBeenCalledWith('application/octet-stream');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="test.txt"');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Length', '18');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(pipelineMock).toHaveBeenCalledTimes(1);
      expect(pipelineMock).toHaveBeenCalledWith(expect.anything(), res);
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next with error when download fails', async () => {
      const error = new Error('Download failed');
      vi.spyOn(applicationService, 'downloadFile').mockRejectedValue(error);

      const req = mockRequest({
        params: { innsendingsId, attachmentId, fileId },
      });
      req.getTokenxAccessToken = () => accessToken;
      const res = mockResponse() as ReturnType<typeof mockResponse> & { setHeader: ReturnType<typeof vi.fn> };
      res.status.mockReturnValue(res);
      res.setHeader = vi.fn();
      const next = vi.fn();

      await attachmentsEndpoints.get(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(pipelineMock).not.toHaveBeenCalled();
    });

    it('uses octet-stream fallback when content-type is missing', async () => {
      const fileStream = new ReadableStream({
        start: (controller) => {
          controller.close();
        },
      });
      vi.spyOn(applicationService, 'downloadFile').mockResolvedValue({
        fileStream,
      });

      const req = mockRequest({
        params: { innsendingsId, attachmentId, fileId },
      });
      req.getTokenxAccessToken = () => accessToken;
      const res = mockResponse() as ReturnType<typeof mockResponse> & { setHeader: ReturnType<typeof vi.fn> };
      res.status.mockReturnValue(res);
      res.setHeader = vi.fn();
      const next = vi.fn();

      await attachmentsEndpoints.get(req, res, next);

      expect(res.contentType).toHaveBeenCalledWith('application/octet-stream');
      expect(next).not.toHaveBeenCalled();
    });
  });
});
