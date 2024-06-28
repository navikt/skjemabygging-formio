import fs from 'fs';
import { loadFileFromDirectory } from './forms';

describe('get forms', () => {
  let spyOpen;

  beforeEach(() => {
    spyOpen = vi.spyOn(fs.promises, 'open').mockReturnValue({
      readFile: vi.fn().mockReturnValue(JSON.stringify({ content: 'fileContent' })),
      close: vi.fn(),
    });
    vi.spyOn(fs, 'readdirSync').mockReturnValue([
      'fileNameWithoutExtension.json',
      'fileNameWithExtension.json',
      'filename.json',
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadFileFromDirectory', () => {
    it('adds .json extension on file name, if missing', async () => {
      await loadFileFromDirectory('dir', 'fileNameWithoutExtension');
      expect(spyOpen).toHaveBeenCalledTimes(1);
      expect(spyOpen).toHaveBeenCalledWith('dir/fileNameWithoutExtension.json', 'r');
    });

    it('does not add file extension if filename ends with .json', async () => {
      await loadFileFromDirectory('dir', 'fileNameWithExtension.json');
      expect(spyOpen).toHaveBeenCalledTimes(1);
      expect(spyOpen).toHaveBeenCalledWith('dir/fileNameWithExtension.json', 'r');
    });

    it("returns empty object if file doesn't exist", async () => {
      await loadFileFromDirectory('dir', 'missingFile.json').then((data) => expect(data).toEqual({}));
    });

    it('returns content of file if it exists', async () => {
      await loadFileFromDirectory('', 'filename').then((data) => expect(data).toEqual({ content: 'fileContent' }));
    });
  });
});
