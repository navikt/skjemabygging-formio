import { Server } from 'node:net';

// Report successful binds from the child itself, not from an unrelated HTTP listener.
const listen = Server.prototype.listen;
Server.prototype.listen = function (...args) {
  this.once('listening', () => {
    const address = this.address();
    if (address && typeof address === 'object' && process.connected) {
      process.send({ type: 'listening', port: address.port, pid: process.pid });
    }
  });
  return listen.apply(this, args);
};
