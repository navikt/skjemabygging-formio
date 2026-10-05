import type { StorageEngine } from 'multer';
import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pipeline } from 'node:stream';

const unlinkTemporaryFile = async (path: string): Promise<void> => {
  try {
    await unlink(path);
  } catch (error) {
    if (typeof error !== 'object' || error === null || !('code' in error) || error.code !== 'ENOENT') {
      throw error;
    }
  }
};

const createTemporaryFileStorage = (directory = tmpdir()): StorageEngine => {
  const pendingRemovals = new Map<string, () => Promise<void>>();

  return {
    _handleFile: (_req, file, callback) => {
      const filename = randomUUID();
      const path = join(directory, filename);
      const output = createWriteStream(path, { flags: 'wx', mode: 0o600 });
      file.path = path;
      let created = false;
      output.once('open', () => {
        created = true;
      });
      const closed = new Promise<void>((resolve) => output.once('close', () => resolve()));
      let removal: Promise<void> | undefined;
      const remove = () => {
        if (!removal) {
          output.destroy();
          removal = closed
            .then(() => (created ? unlinkTemporaryFile(path) : undefined))
            .finally(() => pendingRemovals.delete(path));
        }
        return removal;
      };
      pendingRemovals.set(path, remove);

      // Unlike pipe(), pipeline() closes the destination when the incoming file stream fails.
      pipeline(file.stream, output, (error) => {
        if (error) {
          remove().then(
            () => callback(error),
            (cleanupError: unknown) =>
              callback(
                new AggregateError([error, cleanupError], 'Failed to clean up a temporary upload.', { cause: error }),
              ),
          );
          return;
        }

        pendingRemovals.delete(path);
        callback(null, { destination: directory, filename, path, size: output.bytesWritten });
      });
    },
    _removeFile: (_req, file, callback) => {
      // Multer can request removal while the write stream is still opening or writing.
      const remove = pendingRemovals.get(file.path);
      const removal = remove ? remove() : unlinkTemporaryFile(file.path);
      removal.then(() => callback(null), callback);
    },
  };
};

export { createTemporaryFileStorage };
