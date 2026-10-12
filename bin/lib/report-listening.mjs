import { writeFileSync } from 'node:fs';
import { Server } from 'node:net';
import { resolve } from 'node:path';

// Report successful binds from the child itself, not from an unrelated HTTP listener.
const listen = Server.prototype.listen;
Server.prototype.listen = function (...args) {
  const onBindError = (error) => {
    const message = { type: 'listen-error', code: error.code, port: error.port, pid: process.pid };
    if (process.env.MANAGED_STACK_BIND_REPORT_DIR) {
      // A library error handler may exit before IPC has flushed.
      writeFileSync(resolve(process.env.MANAGED_STACK_BIND_REPORT_DIR, `${process.pid}.json`), JSON.stringify(message));
    }
    if (process.connected) {
      process.send(message);
    }
  };
  this.prependOnceListener('error', onBindError);
  this.once('listening', () => {
    this.off('error', onBindError);
    const address = this.address();
    if (address && typeof address === 'object' && process.connected) {
      process.send({ type: 'listening', port: address.port, pid: process.pid });
    }
  });
  return listen.apply(this, args);
};
