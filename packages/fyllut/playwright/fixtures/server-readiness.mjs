import { channel } from 'node:diagnostics_channel';
import { appendFileSync } from 'node:fs';

const logPath = process.env.FYLLUT_PLAYWRIGHT_LISTEN_LOG;
if (!logPath) throw new Error('Missing FYLLUT_PLAYWRIGHT_LISTEN_LOG');
const ports = new Set();

// Observe accepted sockets without replacing listen() or changing application code.
channel('net.server.socket').subscribe(({ socket }) => {
  if (ports.has(socket.localPort)) return;
  appendFileSync(logPath, `${process.pid}:${socket.localPort}\n`);
  ports.add(socket.localPort);
});
