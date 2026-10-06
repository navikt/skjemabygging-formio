import { correlator, requestAbortHandler } from '@navikt/skjemadigitalisering-shared-backend';
import express, { NextFunction, Request, Response } from 'express';
import { createWriteStream } from 'node:fs';
import { mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { AddressInfo, createConnection, Socket } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { logger as errorLogger } from '../../../../../shared-backend/src/shared/logger/logger';
import { logger } from '../../../logger';
import { uploadSingleFile } from './upload';

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return { ...actual, createWriteStream: vi.fn(actual.createWriteStream) };
});

let directory: string;
let originalTmpdir: string | undefined;

beforeEach(async () => {
  vi.clearAllMocks();
  originalTmpdir = process.env.TMPDIR;
  directory = await mkdtemp(join(tmpdir(), 'upload-disconnect-test-'));
  process.env.TMPDIR = directory;
});

afterEach(async () => {
  if (originalTmpdir === undefined) {
    delete process.env.TMPDIR;
  } else {
    process.env.TMPDIR = originalTmpdir;
  }
  vi.restoreAllMocks();
  await rm(directory, { recursive: true, force: true });
});

describe('multipart upload integration', () => {
  it.each([
    { phase: 'partial file', mode: 'digital' },
    { phase: 'completed file', mode: 'digital' },
    { phase: 'partial file', mode: 'nologin' },
    { phase: 'completed file', mode: 'nologin' },
  ])(
    'retains upload context and closes and deletes a $phase when a $mode multipart request is aborted',
    async ({ phase, mode }) => {
      const expectedId = 'multipart-abort-correlation';
      let loggedCorrelationId: string | undefined;
      const info = vi.spyOn(errorLogger, 'info').mockImplementation(() => {
        loggedCorrelationId = correlator.getId();
        return errorLogger;
      });
      const warn = vi.spyOn(errorLogger, 'warn');
      const error = vi.spyOn(errorLogger, 'error');
      const uploadInfo = vi.spyOn(logger, 'info');
      const uploadWarn = vi.spyOn(logger, 'warn');
      const route = vi.fn((_req: Request, res: Response) => res.sendStatus(204));
      const handleError = vi.fn((_error: unknown, _req: Request, res: Response, _next: NextFunction) =>
        res.sendStatus(500),
      );
      const app = express();
      app.use(correlator());
      const router = express.Router();
      if (mode === 'nologin') {
        router.use((req, _res, next) => {
          req.getNologinContext = () => ({ innsendingsId: 'submission-1' });
          next();
        });
      }
      router.post(
        mode === 'digital' ? '/digital/:innsendingsId/attachments/:attachmentId' : '/nologin/attachments/:attachmentId',
        uploadSingleFile('filinnhold'),
        route,
      );
      app.use('/fyllut/api/send-inn', router);
      app.use(requestAbortHandler);
      app.use(handleError);
      const uploadPath = `/fyllut/api/send-inn/${mode === 'digital' ? 'digital/submission-1' : 'nologin'}/attachments/attachment-1`;
      const send = vi.fn();
      const server = createServer((req, res) => {
        vi.spyOn(res, 'writeHead').mockImplementation(send);
        vi.spyOn(res, 'end').mockImplementation(send);
        app(req, res);
      });
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
      let socket: Socket | undefined;

      try {
        const address = server.address() as AddressInfo;
        const clientSocket = createConnection({ host: '127.0.0.1', port: address.port });
        socket = clientSocket;
        await new Promise<void>((resolve, reject) => {
          clientSocket.once('error', reject);
          clientSocket.once('connect', resolve);
        });
        const data = Buffer.alloc(32768, 'x');
        clientSocket.write(
          Buffer.concat([
            Buffer.from(
              `POST ${uploadPath}?access=hidden HTTP/1.1\r\nHost: localhost\r\nx-correlation-id: ${expectedId}\r\nContent-Type: multipart/form-data; boundary=test\r\nContent-Length: 524288\r\nConnection: close\r\n\r\n--test\r\nContent-Disposition: form-data; name="filinnhold"; filename="small.txt"\r\nContent-Type: text/plain\r\n\r\n`,
            ),
            data,
          ]),
        );
        if (phase === 'completed file') {
          clientSocket.write('\r\n--test\r\nContent-Disposition: form-data; name="unfinished"\r\n\r\npartial');
        }

        await vi.waitFor(async () => {
          const files = await readdir(directory);
          expect(files).toHaveLength(1);
          const path = join(directory, files[0]);
          expect((await stat(path)).size).toBe(data.length);
          expect(await readFile(path)).toEqual(data);
          expect(vi.mocked(createWriteStream).mock.results).toHaveLength(1);
          expect(vi.mocked(createWriteStream).mock.results[0].value.closed).toBe(phase === 'completed file');
        });
        const output = vi.mocked(createWriteStream).mock.results[0].value;

        clientSocket.destroy();
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
        expect(output.closed).toBe(true);
        expect(await readdir(directory)).toEqual([]);
        expect(warn).not.toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
        expect(uploadInfo).not.toHaveBeenCalled();
        expect(uploadWarn).not.toHaveBeenCalled();
        expect(route).not.toHaveBeenCalled();
        expect(handleError).not.toHaveBeenCalled();
        expect(send).not.toHaveBeenCalled();
      } finally {
        socket?.destroy();
        server.closeAllConnections();
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    },
  );
});
