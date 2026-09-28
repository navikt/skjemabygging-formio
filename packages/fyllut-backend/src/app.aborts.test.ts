import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
import { createServer } from 'node:http';
import { AddressInfo, createConnection, Socket } from 'node:net';
import request from 'supertest';
import { logger as errorLogger } from '../../shared-backend/src/shared/logger/logger';
import { createApp } from './app';
import { logger } from './logger';

describe('request body correlation', () => {
  it.each(['application/json', 'application/x-www-form-urlencoded'])(
    'retains the correlation id after parsing %s',
    async (contentType) => {
      const expectedId = `body-correlation-${contentType}`;
      let loggedCorrelationId: string | undefined;
      const info = vi.spyOn(logger, 'info').mockImplementation(() => {
        loggedCorrelationId = correlator.getId();
        return logger;
      });

      try {
        await request(createApp())
          .post('/fyllut/api/log/info')
          .set('x-correlation-id', expectedId)
          .type(contentType)
          .send({ marker: contentType })
          .expect(200);

        expect(info).toHaveBeenCalledWith({ marker: contentType, source: 'frontend' });
        expect(loggedCorrelationId).toBe(expectedId);
      } finally {
        info.mockRestore();
      }
    },
  );
});

describe('request body aborts', () => {
  it('logs an incomplete JSON request once with a correlation id', async () => {
    const handlerWarning = vi.spyOn(errorLogger, 'warn');
    const handlerError = vi.spyOn(errorLogger, 'error');
    let socket: Socket | undefined;
    const app = createApp();
    const server = createServer((req, res) => {
      req.once('data', () => socket?.destroy());
      app(req, res);
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

    try {
      const address = server.address() as AddressInfo;
      const clientSocket = createConnection({ host: '127.0.0.1', port: address.port });
      socket = clientSocket;
      await new Promise<void>((resolve) => {
        clientSocket.on('connect', () => {
          clientSocket.write(
            'POST /fyllut/api/config HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/json\r\nContent-Length: 100\r\nConnection: close\r\n\r\n{"incomplete":',
          );
          resolve();
        });
      });
      await vi.waitFor(() => expect(handlerWarning).toHaveBeenCalledOnce());

      expect(handlerWarning.mock.calls[0][0]).toMatchObject({
        errorCode: 'BAD_REQUEST',
        message: 'Request body was aborted.',
        correlationId: expect.any(String),
      });
      expect(handlerError).not.toHaveBeenCalled();
    } finally {
      socket?.destroy();
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      handlerWarning.mockRestore();
      handlerError.mockRestore();
    }
  });
});
