import { createServer } from 'node:http';
import { AddressInfo, createConnection, Socket } from 'node:net';
import { logger as errorLogger } from '../../shared-backend/src/shared/logger/logger';
import { createApp } from './app';

describe('request body aborts', () => {
  it('logs an incomplete JSON request once without attempting a response', async () => {
    const handlerInfo = vi.spyOn(errorLogger, 'info').mockImplementation(() => errorLogger);
    const handlerWarning = vi.spyOn(errorLogger, 'warn');
    const handlerError = vi.spyOn(errorLogger, 'error');
    const expectedId = 'aborted-body-correlation';
    const send = vi.fn();
    let socket: Socket | undefined;
    const app = createApp();
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
      await new Promise<void>((resolve) => {
        clientSocket.on('connect', () => {
          clientSocket.write(
            `POST /fyllut/api/config HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/json\r\nx-correlation-id: ${expectedId}\r\nContent-Length: 100\r\nConnection: close\r\n\r\nincomplete`,
          );
          resolve();
        });
      });
      await vi.waitFor(() => expect(handlerInfo).toHaveBeenCalledOnce());

      expect(handlerInfo).toHaveBeenCalledWith({
        message: 'Request body was aborted.',
        correlationId: expectedId,
        route: '/fyllut/api/config',
      });
      expect(send).not.toHaveBeenCalled();
      expect(handlerWarning).not.toHaveBeenCalled();
      expect(handlerError).not.toHaveBeenCalled();
    } finally {
      socket?.destroy();
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      vi.restoreAllMocks();
    }
  });
});
