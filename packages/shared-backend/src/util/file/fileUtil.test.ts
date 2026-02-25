import fs from 'fs';
import fileUtil from './fileUtil';

describe('fileUtil', () => {
  let spyOpen;

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
});
