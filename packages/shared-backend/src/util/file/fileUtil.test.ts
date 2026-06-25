import fs from 'fs';
import os from 'node:os';
import path from 'node:path';
import fileUtil from './fileUtil';

describe('fileUtil', () => {
  let spyOpen;
  const createdPaths: string[] = [];

  const createTempDirectory = (rootDir: string, prefix: string) => {
    const directory = fs.mkdtempSync(path.join(rootDir, prefix));
    createdPaths.push(directory);
    return directory;
  };

  beforeEach(() => {
    spyOpen = vi.spyOn(fs.promises, 'open').mockReturnValue({
      // @ts-expect-error Ignore this after js conversion.
      readFile: vi.fn().mockReturnValue(JSON.stringify({ content: 'fileContent' })),
      close: vi.fn(),
    });
    vi.spyOn(fs, 'readdirSync').mockReturnValue(
      // @ts-expect-error Ignore this after js conversion.
      ['fileNameWithoutExtension.json', 'fileNameWithExtension.json', 'filename.json'],
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    createdPaths
      .splice(0)
      .reverse()
      .forEach((createdPath) => {
        fs.rmSync(createdPath, { force: true, recursive: true });
      });
  });

  describe('loadJsonFileFromDirectory', () => {
    it('adds .json extension on file name, if missing', async () => {
      await fileUtil.loadJsonFileFromDirectory('dir', 'fileNameWithoutExtension');
      expect(spyOpen).toHaveBeenCalledTimes(1);
      expect(spyOpen).toHaveBeenCalledWith('dir/fileNameWithoutExtension.json', 'r');
    });

    it('does not add file extension if filename ends with .json', async () => {
      await fileUtil.loadJsonFileFromDirectory('dir', 'fileNameWithExtension.json');
      expect(spyOpen).toHaveBeenCalledTimes(1);
      expect(spyOpen).toHaveBeenCalledWith('dir/fileNameWithExtension.json', 'r');
    });

    it("returns undefined if file doesn't exist", async () => {
      const data = await fileUtil.loadJsonFileFromDirectory('dir', 'missingFile.json');
      expect(data).toEqual(undefined);
    });

    it('returns content of file if it exists', async () => {
      const data = await fileUtil.loadJsonFileFromDirectory('dir', 'filename');
      expect(data).toEqual({ content: 'fileContent' });
    });
  });

  describe('createBlobFromUploadedFile', () => {
    it('creates a blob from an uploaded temp file in the OS temp directory', async () => {
      const tempDirectory = createTempDirectory(os.tmpdir(), 'file-util-test-');
      const filePath = path.join(tempDirectory, 'upload.txt');
      fs.writeFileSync(filePath, 'temporary file');

      const blob = await fileUtil.createBlobFromUploadedFile({
        path: filePath,
        mimetype: 'text/plain',
        buffer: Buffer.alloc(0),
      });

      await expect(blob.text()).resolves.toBe('temporary file');
    });

    it('creates a blob from the in-memory file buffer when no temp file path exists', async () => {
      const blob = await fileUtil.createBlobFromUploadedFile({
        mimetype: 'text/plain',
        buffer: Buffer.from('buffer file'),
      });

      await expect(blob.text()).resolves.toBe('buffer file');
    });

    it('rejects temp files outside the OS temp directory', async () => {
      const tempDirectory = createTempDirectory(process.cwd(), 'file-util-test-');
      const filePath = path.join(tempDirectory, 'upload.txt');
      fs.writeFileSync(filePath, 'temporary file');

      await expect(
        fileUtil.createBlobFromUploadedFile({
          path: filePath,
          mimetype: 'text/plain',
          buffer: Buffer.alloc(0),
        }),
      ).rejects.toThrow('Invalid temporary upload path');
    });
  });
});
