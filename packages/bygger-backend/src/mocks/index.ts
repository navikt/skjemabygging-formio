import { logger } from '../logging/logger';
import { server } from './node-server';
import mswUtils from './utils/mswUtils';

server.events.on('unhandledException', ({ request, requestId, error }) => {
  logger.error(`[MSW] unhandledException: ${request.method} ${request.url} (requestId ${requestId})`, error);
});

server.events.on('response:mocked', ({ request, response }) => {
  logger.info(
    `[MSW] response:mocked => ${request.method} ${request.url} received ${response.status} ${response.statusText}`,
  );
});

server.events.on('request:start', ({ request }) => {
  logger.info(`[MSW] Outgoing: ${request.method} ${request.url}`);
});

server.listen({
  onUnhandledRequest: 'error',
});

export { mswUtils };
