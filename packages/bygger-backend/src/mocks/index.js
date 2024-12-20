import { server } from './node-server';

server.listen({
  onUnhandledRequest: 'error',
});
