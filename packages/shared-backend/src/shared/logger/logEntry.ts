type LogEntry = Record<string, unknown>;

const emptyMessage = 'No message';

const toLogMessage = (message: unknown): string => {
  if (typeof message === 'string') return message;
  if (message === undefined || message === null) return '';
  try {
    return JSON.stringify(message) ?? String(message);
  } catch {
    return String(message);
  }
};

/**
 * Makes sure `message` is non-empty text. Winston puts the whole entry in `message` when it gets
 * an object whose message is empty. Pass the entry as one object: with a separate message string,
 * Winston drops the metadata when the message contains a format token such as %d.
 */
const toLogEntry = ({ message, ...meta }: LogEntry): LogEntry & { message: string } => ({
  ...meta,
  message: toLogMessage(message) || emptyMessage,
});

export { toLogEntry };
