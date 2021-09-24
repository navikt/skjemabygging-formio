import fs from "fs";
import glob from "glob";
import fetch from "node-fetch";

const readFile = async (filepath) => {
  const filehandle = await fs.promises.open(filepath, "r");
  let fileContents = await filehandle.readFile({ encoding: "utf-8" });
  await filehandle.close();
  return fileContents;
};

const loadJsonFileFromDisk = async (dir, filename) => {
  const jsonFileName = filename.endsWith(".json") ? filename : `${filename}.json`;
  const jsonFilePath = `${dir}/${jsonFileName}`;
  console.log(jsonFilePath);
  if (fs.existsSync(jsonFilePath)) {
    const file = await readFile(jsonFilePath);
    return JSON.parse(file);
  }
  console.warn("File does not exist:", jsonFilePath);
  return {};
};

const loadJsonFilesFromDisk = async (dir) => {
  if (fs.existsSync(dir)) {
    const files = glob.sync(`${dir}/*.json`);
    const promises = files.map(readFile);
    const fileContentsList = await Promise.all(promises);
    return fileContentsList.map(JSON.parse);
  }
  console.warn("Directory does not exist:", dir);
  return [];
};

const fetchFormsFromFormioApi = async (url) => {
  if (url) {
    const response = await fetch(url, { method: "GET" });
    if (response.ok) {
      return await response.json();
    }
    console.log("Failed to retrieve forms from ", url);
  }
  return [];
};

export { loadJsonFilesFromDisk, loadJsonFileFromDisk, fetchFormsFromFormioApi };
