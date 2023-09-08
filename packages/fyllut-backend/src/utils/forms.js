import fs from "fs";
import { glob } from "glob";
import fetch from "node-fetch";

const readFile = async (filepath) => {
  const filehandle = await fs.promises.open(filepath, "r");
  let fileContents = await filehandle.readFile({ encoding: "utf-8" });
  await filehandle.close();
  return fileContents;
};

const loadFileFromDirectory = async (dir, filename, defaultReturn = {}) => {
  const existingFileNames = fs.readdirSync(dir);
  const existingFileName = existingFileNames.find(
    (approvedFileName) => approvedFileName.replace(".json", "") === filename.replace(".json", "")
  );
  if (existingFileName) {
    const file = await readFile(`${dir}/${existingFileName}`);
    return JSON.parse(file);
  }
  console.warn(`File "${filename}" does not exist in directory "${dir}"`);
  return defaultReturn;
};

const loadAllJsonFilesFromDirectory = async (dir) => {
  if (fs.existsSync(dir)) {
    const files = glob.sync(`${dir}/*.json`);
    const promises = files.map(readFile);
    const fileContentsList = await Promise.all(promises);
    return fileContentsList.map(JSON.parse);
  }
  console.warn("Directory does not exist:", dir);
  return [];
};

const fetchFromFormioApi = async (url) => {
  if (url) {
    const response = await fetch(url, { method: "GET" });
    if (response.ok) {
      return await response.json();
    }
    console.log("Failed to retrieve forms from ", url);
  }
  return [];
};

export { loadAllJsonFilesFromDirectory, loadFileFromDirectory, fetchFromFormioApi };
