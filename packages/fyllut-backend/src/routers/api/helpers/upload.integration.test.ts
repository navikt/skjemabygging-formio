import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
import express, { NextFunction, Request, Response } from 'express';
import { createServer } from 'node:http';
import { AddressInfo, createConnection, Socket } from 'node:net';
import { logger } from '../../../logger';
import { uploadSingleFile } from './upload';

afterEach(() => vi.restoreAllMocks());

describe('multipart upload integration', () => {
  it('retains request correlation when real multipart stream events report a disconnect', async () => {
    const expectedId = 'multipart-abort-correlation';
    let loggedCorrelationId: string | undefined;
    const info = vi.spyOn(logger, 'info').mockImplementation(() => {
      loggedCorrelationId = correlator.getId();
      return logger;
    });
    const warn = vi.spyOn(logger, 'warn');
    const route = vi.fn((_req: Request, res: Response) => res.sendStatus(204));
    const handleError = vi.fn((_error: unknown, _req: Request, res: Response, _next: NextFunction) =>
      res.sendStatus(500),
    );
    const app = express();
    app.use(correlator());
    app.post('/upload', uploadSingleFile('filinnhold'), route);
    app.use(handleError);
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
            `POST /upload HTTP/1.1\r\nHost: localhost\r\nx-correlation-id: ${expectedId}\r\nContent-Type: multipart/form-data; boundary=test\r\nContent-Length: 1000\r\nConnection: close\r\n\r\n--test\r\nContent-Disposition: form-data; name="filinnhold"; filename="small.txt"\r\nContent-Type: text/plain\r\n\r\npartial`,
          );
          resolve();
        });
      });
      await vi.waitFor(() => expect(info).toHaveBeenCalledOnce());

      expect(loggedCorrelationId).toBe(expectedId);
      expect(info).toHaveBeenCalledWith(
        'Upload request aborted',
        expect.objectContaining({ route: '/upload', fieldName: 'filinnhold' }),
      );
      expect(warn).not.toHaveBeenCalled();
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
