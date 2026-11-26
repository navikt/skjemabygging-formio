import { Writable } from 'stream';
import { describe, expect, it } from 'vitest';
import { createLogger, format, transports } from 'winston';
import { toLogEntry } from './logEntry';

const logWithWinston = (entry: Record<string, unknown>) => {
  const lines: string[] = [];
  const stream = new Writable({
    write: (chunk, _encoding, callback) => {
      lines.push(chunk.toString());
      callback();
    },
  });
  createLogger({ format: format.json(), transports: [new transports.Stream({ stream })] }).error(toLogEntry(entry));
  return JSON.parse(lines[0]);
};

describe('toLogEntry', () => {
  it.each([
    ['a text message', 'Server Error', 'Server Error'],
    ['an empty message', '', 'No message'],
    ['a missing message', undefined, 'No message'],
    ['an object message', { code: 'X' }, '{"code":"X"}'],
    ['a message with format tokens', 'Failed 100%d %s', 'Failed 100%d %s'],
  ])('logs %s as text and keeps the metadata', (_case, message, expected) => {
    expect(logWithWinston({ message, errorCode: 'INTERNAL_SERVER_ERROR', stackTrace: 'stack' })).toEqual({
      level: 'error',
      message: expected,
      errorCode: 'INTERNAL_SERVER_ERROR',
      stackTrace: 'stack',
    });
  });
});
