import type { Request } from 'express';
import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdtemp, readFile, readdir, rm, stat, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { createTemporaryFileStorage } from './temporaryFileStorage';

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return { ...actual, createWriteStream: vi.fn(actual.createWriteStream) };
});

vi.mock('node:crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:crypto')>();
  return { ...actual, randomUUID: vi.fn(actual.randomUUID) };
});

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  return { ...actual, unlink: vi.fn(actual.unlink) };
});

const createFile = (stream: Readable): Express.Multer.File => ({
  fieldname: 'file',
  originalname: 'upload.txt',
  encoding: '7bit',
  mimetype: 'text/plain',
  stream,
  destination: '',
  filename: '',
  path: '',
  size: 0,
  buffer: Buffer.alloc(0),
});

const req = {} as Request;
let directory: string;

beforeEach(async () => {
  vi.clearAllMocks();
  directory = await mkdtemp(join(tmpdir(), 'temporary-storage-test-'));
});

afterEach(async () => {
  vi.mocked(unlink).mockReset();
  const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  vi.mocked(unlink).mockImplementation(actual.unlink);
  await rm(directory, { recursive: true, force: true });
});

describe('createTemporaryFileStorage', () => {
  it('writes an upload and closes its file before reporting success', async () => {
    const storage = createTemporaryFileStorage(directory);
    const file = createFile(Readable.from('file contents'));
    const callback = vi.fn();

    storage._handleFile(req, file, callback);
    await vi.waitFor(() => expect(callback).toHaveBeenCalledOnce());

    const output = vi.mocked(createWriteStream).mock.results[0].value;
    expect(output.closed).toBe(true);
    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ destination: directory, path: file.path, size: 13 }),
    );
    expect(await readFile(file.path, 'utf8')).toBe('file contents');
    expect((await stat(file.path)).mode & 0o777).toBe(0o600);

    const removed = vi.fn();
    storage._removeFile(req, file, removed);
    await vi.waitFor(() => expect(removed).toHaveBeenCalledExactlyOnceWith(null));
    expect(await readdir(directory)).toEqual([]);
  });

  it('closes and removes an in-progress file once even when removal is requested twice', async () => {
    const storage = createTemporaryFileStorage(directory);
    const stream = new Readable({ read() {} });
    const file = createFile(stream);
    const callback = vi.fn();
    storage._handleFile(req, file, callback);
    stream.push('partial file');
    await vi.waitFor(async () => expect((await stat(file.path)).size).toBe(12));
    const output = vi.mocked(createWriteStream).mock.results[0].value;
    expect(output.closed).toBe(false);
    const removed = vi.fn();

    storage._removeFile(req, file, removed);
    storage._removeFile(req, file, removed);
    await vi.waitFor(() => expect(removed).toHaveBeenCalledTimes(2));

    expect(removed.mock.calls).toEqual([[null], [null]]);
    expect(output.closed).toBe(true);
    expect(vi.mocked(unlink)).toHaveBeenCalledExactlyOnceWith(file.path);
    expect(await readdir(directory)).toEqual([]);
    await vi.waitFor(() => expect(callback).toHaveBeenCalledOnce());
    expect(callback.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('closes and removes a partial file when its incoming stream fails', async () => {
    const storage = createTemporaryFileStorage(directory);
    const stream = new Readable({ read() {} });
    const file = createFile(stream);
    const callback = vi.fn();
    storage._handleFile(req, file, callback);
    stream.push('partial file');
    await vi.waitFor(async () => expect((await stat(file.path)).size).toBe(12));
    const error = new Error('upload stream failed');

    stream.destroy(error);
    await vi.waitFor(() => expect(callback).toHaveBeenCalledExactlyOnceWith(error));

    expect(vi.mocked(createWriteStream).mock.results[0].value.closed).toBe(true);
    expect(await readdir(directory)).toEqual([]);
  });

  it('reports deletion failures without leaving the write stream open', async () => {
    const storage = createTemporaryFileStorage(directory);
    const stream = new Readable({ read() {} });
    const file = createFile(stream);
    const callback = vi.fn();
    storage._handleFile(req, file, callback);
    stream.push('partial file');
    await vi.waitFor(async () => expect((await stat(file.path)).size).toBe(12));
    const cleanupError = Object.assign(new Error('Cannot remove file'), { code: 'EACCES' });
    vi.mocked(unlink).mockRejectedValueOnce(cleanupError);
    const removed = vi.fn();

    storage._removeFile(req, file, removed);
    await vi.waitFor(() => expect(removed).toHaveBeenCalledExactlyOnceWith(cleanupError));

    expect(vi.mocked(createWriteStream).mock.results[0].value.closed).toBe(true);
    await vi.waitFor(() => expect(callback).toHaveBeenCalledOnce());
    expect(callback.mock.calls[0][0]).toBeInstanceOf(AggregateError);
    expect(callback.mock.calls[0][0].errors).toContain(cleanupError);
    expect(await readdir(directory)).toHaveLength(1);
  });

  it('allows removal of an already absent file', async () => {
    const file = createFile(Readable.from(''));
    file.path = join(directory, 'already-removed');
    const callback = vi.fn();

    createTemporaryFileStorage(directory)._removeFile(req, file, callback);
    await vi.waitFor(() => expect(callback).toHaveBeenCalledExactlyOnceWith(null));
  });

  it('reports destination errors and closes the failed write stream', async () => {
    const file = createFile(Readable.from('file contents'));
    const callback = vi.fn();

    createTemporaryFileStorage(join(directory, 'missing-directory'))._handleFile(req, file, callback);
    await vi.waitFor(() => expect(callback).toHaveBeenCalledOnce());

    expect(callback.mock.calls[0][0]).toMatchObject({ code: 'ENOENT' });
    expect(vi.mocked(createWriteStream).mock.results[0].value.closed).toBe(true);
    expect(await readdir(directory)).toEqual([]);
  });

  it.each(['removal while opening', 'already closed incoming stream'])(
    'cleans up without late file creation after %s',
    async (phase) => {
      const storage = createTemporaryFileStorage(directory);
      const stream = new Readable({ read() {} });
      if (phase === 'already closed incoming stream') {
        stream.destroy();
      }
      const file = createFile(stream);
      const callback = vi.fn();
      const removed = vi.fn();

      storage._handleFile(req, file, callback);
      if (phase === 'removal while opening') {
        storage._removeFile(req, file, removed);
      }
      await vi.waitFor(() => expect(callback).toHaveBeenCalledOnce());

      expect(removed.mock.calls).toEqual(phase === 'removal while opening' ? [[null]] : []);
      expect(callback.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(vi.mocked(createWriteStream).mock.results[0].value.closed).toBe(true);
      expect(await readdir(directory)).toEqual([]);
    },
  );

  it('does not remove an existing file when exclusive creation fails', async () => {
    const filename = '00000000-0000-0000-0000-000000000000';
    vi.mocked(randomUUID).mockReturnValueOnce(filename);
    const path = join(directory, filename);
    await writeFile(path, 'existing file');
    const callback = vi.fn();

    createTemporaryFileStorage(directory)._handleFile(req, createFile(Readable.from('new file')), callback);
    await vi.waitFor(() => expect(callback).toHaveBeenCalledOnce());

    expect(callback.mock.calls[0][0]).toMatchObject({ code: 'EEXIST' });
    expect(vi.mocked(createWriteStream).mock.results[0].value.closed).toBe(true);
    expect(await readFile(path, 'utf8')).toBe('existing file');
    expect(vi.mocked(unlink)).not.toHaveBeenCalled();
  });
});
