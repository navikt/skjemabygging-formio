import { loadJsonFileFromDisk } from "./forms";
import { jest } from "@jest/globals";
import fs from "fs";

const fsOpenMock = jest.fn().mockImplementation(() => ({
  readFile: jest.fn().mockReturnValue(JSON.stringify({ content: "fileContent" })),
  close: jest.fn(),
}));

describe("get forms", () => {
  fs.existsSync = jest.fn(() => true);
  fs.promises.open = fsOpenMock;

  afterEach(() => {
    fs.existsSync.mockClear();
    fsOpenMock.mockClear();
  });

  describe("loadJsonFileFromDisk", () => {
    it("adds .json extension on file name, if missing", async () => {
      await loadJsonFileFromDisk("dir", "fileNameWithoutExtension");
      expect(fsOpenMock).toHaveBeenCalledTimes(1);
      expect(fsOpenMock).toHaveBeenCalledWith("dir/fileNameWithoutExtension.json", "r");
    });

    it("does not add file extension if filename ends with .json", async () => {
      await loadJsonFileFromDisk("dir", "fileNameWithExtension.json");
      expect(fsOpenMock).toHaveBeenCalledTimes(1);
      expect(fsOpenMock).toHaveBeenCalledWith("dir/fileNameWithExtension.json", "r");
    });

    it("returns empty object if file doesn't exist", async () => {
      fs.existsSync.mockImplementation(() => false);
      await loadJsonFileFromDisk("dir", "missingFile.json").then((data) => expect(data).toEqual({}));
    });

    it("returns content of file if it exists", async () => {
      fs.existsSync.mockImplementation(() => true);
      await loadJsonFileFromDisk("", "filename").then((data) => expect(data).toEqual({ content: "fileContent" }));
    });
  });
});
