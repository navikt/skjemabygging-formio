import { jest } from "@jest/globals";
import fs from "fs";
import { loadFileFromDirectory } from "./forms";

const fsOpenMock = jest.fn().mockImplementation(() => ({
  readFile: jest.fn().mockReturnValue(JSON.stringify({ content: "fileContent" })),
  close: jest.fn(),
}));

describe("get forms", () => {
  fs.readdirSync = jest.fn(() => ["fileNameWithoutExtension.json", "fileNameWithExtension.json", "filename.json"]);
  fs.promises.open = fsOpenMock;

  afterEach(() => {
    fs.readdirSync.mockClear();
    fsOpenMock.mockClear();
  });

  describe("loadFileFromDirectory", () => {
    it("adds .json extension on file name, if missing", async () => {
      await loadFileFromDirectory("dir", "fileNameWithoutExtension");
      expect(fsOpenMock).toHaveBeenCalledTimes(1);
      expect(fsOpenMock).toHaveBeenCalledWith("dir/fileNameWithoutExtension.json", "r");
    });

    it("does not add file extension if filename ends with .json", async () => {
      await loadFileFromDirectory("dir", "fileNameWithExtension.json");
      expect(fsOpenMock).toHaveBeenCalledTimes(1);
      expect(fsOpenMock).toHaveBeenCalledWith("dir/fileNameWithExtension.json", "r");
    });

    it("returns empty object if file doesn't exist", async () => {
      await loadFileFromDirectory("dir", "missingFile.json").then((data) => expect(data).toEqual({}));
    });

    it("returns content of file if it exists", async () => {
      await loadFileFromDirectory("", "filename").then((data) => expect(data).toEqual({ content: "fileContent" }));
    });
  });
});
