import { correlator, requestAbortHandler } from '@navikt/skjemadigitalisering-shared-backend';
import express, { NextFunction, Request, Response } from 'express';
import { createServer } from 'node:http';
import { AddressInfo, createConnection, Socket } from 'node:net';
import { logger as errorLogger } from '../../../../../shared-backend/src/shared/logger/logger';
import { logger } from '../../../logger';
import { uploadSingleFile } from './upload';

afterEach(() => vi.restoreAllMocks());

describe('multipart upload integration', () => {
  // requestAbortHandler matches Multer's disconnect messages, so this test uses real Multer.
  it('retains upload context when a real multipart request is aborted', async () => {
    const expectedId = 'multipart-abort-correlation';
    let loggedCorrelationId: string | undefined;
    const info = vi.spyOn(errorLogger, 'info').mockImplementation(() => {
      loggedCorrelationId = correlator.getId();
      return errorLogger;
    });
    const warn = vi.spyOn(errorLogger, 'warn');
    const error = vi.spyOn(errorLogger, 'error');
    const uploadInfo = vi.spyOn(logger, 'info');
    const route = vi.fn((_req: Request, res: Response) => res.sendStatus(204));
    const handleError = vi.fn((_error: unknown, _req: Request, res: Response, _next: NextFunction) =>
      res.sendStatus(500),
    );
    const app = express();
    app.use(correlator());
    app.post('/digital/:innsendingsId/attachments/:attachmentId', uploadSingleFile('filinnhold'), route);
    app.use(requestAbortHandler);
    app.use(handleError);
    const uploadPath = '/digital/submission-1/attachments/attachment-1';
    let socket: Socket | undefined;
    const send = vi.fn();
    const server = createServer((req, res) => {
      vi.spyOn(res, 'writeHead').mockImplementation(send);
      vi.spyOn(res, 'end').mockImplementation(send);
      req.once('data', () => socket?.destroy());
      app(req, res);
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

    try {
      const address = server.address() as AddressInfo;
      const clientSocket = createConnection({ host: '127.0.0.1', port: address.port });
      socket = clientSocket;
      await new Promise<void>((resolve, reject) => {
        clientSocket.once('error', reject);
        clientSocket.once('connect', () => {
          clientSocket.write(
            `POST ${uploadPath}?access=hidden HTTP/1.1\r\nHost: localhost\r\nx-correlation-id: ${expectedId}\r\nContent-Type: multipart/form-data; boundary=test\r\nContent-Length: 1000\r\nConnection: close\r\n\r\n--test\r\nContent-Disposition: form-data; name="filinnhold"; filename="small.txt"\r\nContent-Type: text/plain\r\n\r\npartial`,
          );
          resolve();
        });
      });
      await vi.waitFor(() => expect(info).toHaveBeenCalledOnce());

      expect(loggedCorrelationId).toBe(expectedId);
      expect(info).toHaveBeenCalledExactlyOnceWith({
        message: 'Request body was aborted.',
        correlationId: expectedId,
        route: uploadPath,
        fieldName: 'filinnhold',
        innsendingsId: 'submission-1',
        attachmentId: 'attachment-1',
      });
      expect(warn).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
      expect(uploadInfo).not.toHaveBeenCalled();
      expect(route).not.toHaveBeenCalled();
      expect(handleError).not.toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
    } finally {
      socket?.destroy();
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
