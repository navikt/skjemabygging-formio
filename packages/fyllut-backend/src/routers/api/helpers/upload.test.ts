import { correlator, errorHandler } from '@navikt/skjemadigitalisering-shared-backend';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import express, { Request, Response } from 'express';
import { AddressInfo, createConnection, Socket } from 'node:net';
import { Readable } from 'node:stream';
import request from 'supertest';
import { logger as errorLogger } from '../../../../../shared-backend/src/shared/logger/logger';
import { logger } from '../../../logger';
import legacyErrorToResponseError from '../../../middleware/legacyErrorToResponseError';
import { removeUploadedTempFile, uploadSingleFile } from './upload';

const createUploadApp = (maxFileSizeBytes?: number, onRequest?: (req: Request) => void) => {
  const app = express();
  app.use(correlator());
  app.post(
    '/upload',
    (req, _res, next) => {
      onRequest?.(req);
      next();
    },
    uploadSingleFile('filinnhold', { maxFileSizeBytes }),
    async (req, res) => {
      const file = req.file;
      try {
        if (!file) {
          return res.status(400).json({ message: 'Error: Ingen fil sendt med forespørselen' });
        }

        return res.status(201).json({
          fileName: file.originalname,
          size: file.size,
        });
      } finally {
        await removeUploadedTempFile(file);
      }
    },
  );
  app.use(legacyErrorToResponseError);
  app.use(errorHandler);

  return app;
};

describe('uploadSingleFile', () => {
  it('allows files under configured size limit', async () => {
    const app = createUploadApp(10);

    const response = await request(app)
      .post('/upload')
      .attach('filinnhold', Buffer.from('12345'), 'small.txt')
      .expect(201);

    expect(response.body).toEqual({ fileName: 'small.txt', size: 5 });
  });

  it('returns bad request when file exceeds configured size limit', async () => {
    const app = createUploadApp(5);
    const uploadWarning = vi.spyOn(logger, 'warn');
    const handlerWarning = vi.spyOn(errorLogger, 'warn');

    const response = await request(app)
      .post('/upload')
      .attach('filinnhold', Buffer.from('123456'), 'large.txt')
      .expect(400);

    expect(response.body).toMatchObject({
      message: 'Uploaded file exceeds maximum size.',
      errorCode: 'BAD_REQUEST',
      userMessage: TEXTS.statiske.uploadFile.fileTooLargeError,
    });
    expect(uploadWarning).not.toHaveBeenCalled();
    expect(handlerWarning).toHaveBeenCalledOnce();
    uploadWarning.mockRestore();
    handlerWarning.mockRestore();
  });

  it('maps an aborted multipart upload to one non-error log', async () => {
    const uploadInfo = vi.spyOn(logger, 'info');
    const uploadWarning = vi.spyOn(logger, 'warn');
    const handlerWarning = vi.spyOn(errorLogger, 'warn');
    const handlerError = vi.spyOn(errorLogger, 'error');
    const req = new Readable({ read() {} }) as Readable & Request;
    req.headers = { 'content-type': 'multipart/form-data; boundary=test', 'content-length': '100' };
    req.aborted = true;
    const next = vi.fn();

    uploadSingleFile('filinnhold')(req, {} as Response, next);
    req.emit('aborted');
    req.destroy();
    await vi.waitFor(() => expect(uploadInfo).toHaveBeenCalledOnce());

    expect(uploadInfo).toHaveBeenCalledWith('Upload request aborted', { fieldName: 'filinnhold' });
    expect(next).not.toHaveBeenCalled();
    expect(uploadWarning).not.toHaveBeenCalled();
    expect(handlerError).not.toHaveBeenCalled();
    expect(handlerWarning).not.toHaveBeenCalled();

    uploadInfo.mockRestore();
    uploadWarning.mockRestore();
    handlerWarning.mockRestore();
    handlerError.mockRestore();
  });

  it('logs a premature upload stream close without forwarding it', async () => {
    const uploadInfo = vi.spyOn(logger, 'info');
    const req = new Readable({ read() {} }) as Readable & Request;
    req.headers = { 'content-type': 'multipart/form-data; boundary=test', 'content-length': '100' };
    const next = vi.fn();

    uploadSingleFile('filinnhold')(req, {} as Response, next);
    req.destroy();
    await vi.waitFor(() => expect(uploadInfo).toHaveBeenCalledOnce());

    expect(uploadInfo).toHaveBeenCalledWith('Upload request aborted', { fieldName: 'filinnhold' });
    expect(next).not.toHaveBeenCalled();
    uploadInfo.mockRestore();
  });

  it('keeps the correlation id when the client aborts a multipart upload', async () => {
    const handlerWarning = vi.spyOn(errorLogger, 'warn');
    const handlerError = vi.spyOn(errorLogger, 'error');
    const uploadWarning = vi.spyOn(logger, 'warn');
    let loggedCorrelationId: string | undefined;
    const uploadInfo = vi.spyOn(logger, 'info').mockImplementation((message) => {
      if (message === 'Upload request aborted') {
        loggedCorrelationId = correlator.getId();
      }
      return logger;
    });
    let socket: Socket | undefined;
    let initialCorrelationId: string | undefined;
    const app = createUploadApp(undefined, (req) => {
      initialCorrelationId = correlator.getId();
      req.once('data', () => socket?.destroy());
    });
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => server.on('listening', resolve));

    try {
      const address = server.address() as AddressInfo;
      const clientSocket = createConnection({ host: '127.0.0.1', port: address.port });
      socket = clientSocket;
      await new Promise<void>((resolve) => {
        clientSocket.on('connect', () => {
          clientSocket.write(
            'POST /upload HTTP/1.1\r\nHost: localhost\r\nContent-Type: multipart/form-data; boundary=test\r\nContent-Length: 1000\r\nConnection: close\r\n\r\n--test\r\nContent-Disposition: form-data; name="filinnhold"; filename="small.txt"\r\nContent-Type: text/plain\r\n\r\npartial',
          );
          resolve();
        });
      });
      await vi.waitFor(() => expect(uploadInfo).toHaveBeenCalledOnce());

      expect(initialCorrelationId).toEqual(expect.any(String));
      expect(loggedCorrelationId).toBe(initialCorrelationId);
      expect(uploadInfo).toHaveBeenCalledWith('Upload request aborted', { fieldName: 'filinnhold' });
      expect(handlerWarning).not.toHaveBeenCalled();
      expect(handlerError).not.toHaveBeenCalled();
      expect(uploadWarning).not.toHaveBeenCalled();
    } finally {
      socket?.destroy();
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      handlerWarning.mockRestore();
      handlerError.mockRestore();
      uploadWarning.mockRestore();
      uploadInfo.mockRestore();
    }
  });

  it('keeps the correlation id on an unexpected upload stream failure', async () => {
    const handlerError = vi.spyOn(errorLogger, 'error');
    const uploadWarning = vi.spyOn(logger, 'warn');
    let initialCorrelationId: string | undefined;
    const app = createUploadApp(undefined, (req) => {
      initialCorrelationId = correlator.getId();
      req.once('data', () => req.emit('error', new Error('stream failed')));
    });

    const response = await request(app)
      .post('/upload')
      .attach('filinnhold', Buffer.from('hello'), 'small.txt')
      .expect(500);

    expect(initialCorrelationId).toEqual(expect.any(String));
    expect(response.body).toMatchObject({
      errorCode: 'INTERNAL_SERVER_ERROR',
      correlationId: initialCorrelationId,
    });
    expect(response.headers['x-correlation-id']).toBe(initialCorrelationId);
    expect(handlerError).toHaveBeenCalledOnce();
    expect(handlerError.mock.calls[0][0]).toMatchObject({ correlationId: initialCorrelationId });
    expect(uploadWarning).not.toHaveBeenCalled();
    handlerError.mockRestore();
    uploadWarning.mockRestore();
  });

  it('keeps unexpected upload stream failures alertable without a second upload warning', async () => {
    const uploadWarning = vi.spyOn(logger, 'warn');
    const handlerError = vi.spyOn(errorLogger, 'error');
    const req = new Readable({ read() {} }) as Readable & Request;
    req.headers = { 'content-type': 'multipart/form-data; boundary=test', 'content-length': '100' };
    const next = vi.fn();

    uploadSingleFile('filinnhold')(req, {} as Response, next);
    const storageError = new Error('stream failed');
    req.emit('error', storageError);
    req.destroy();
    await vi.waitFor(() => expect(next).toHaveBeenCalledOnce());

    expect(next.mock.calls[0][0]).toBe(storageError);
    const res = {
      locals: {},
      header: vi.fn().mockReturnThis(),
      contentType: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as Response;
    errorHandler(next.mock.calls[0][0], req, res, vi.fn());

    expect(uploadWarning).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(handlerError).toHaveBeenCalledOnce();
    uploadWarning.mockRestore();
    handlerError.mockRestore();
  });
});
