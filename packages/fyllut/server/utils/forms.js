import fs from "fs";
import glob from "glob";
import fetch from "node-fetch";

const readFile = async (filename) => {
  const filehandle = await fs.promises.open(filename, "r");
  let fileContents = await filehandle.readFile({ encoding: "utf-8" });
  await filehandle.close();
  return fileContents;
};

const loadJsonFileFromDisk = async (filepath) => {
  const jsonFilepath = filepath.endsWith(".json") ? filepath : filepath + ".json";
  if (fs.existsSync(jsonFilepath)) {
    const file = await readFile(jsonFilepath);
    return JSON.parse(file);
  }
  console.warn("File does not exist:", jsonFilepath);
  return [];
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
