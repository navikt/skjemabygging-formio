import { glob } from 'glob';
import fetch from 'node-fetch';
import fs from 'node:fs';
import { logger } from '../logger.js';
import { toJsonOrThrowError } from './errorHandling';

const readFile = async (filepath) => {
  const filehandle = await fs.promises.open(filepath, 'r');
  let fileContents = await filehandle.readFile({ encoding: 'utf-8' });
  await filehandle.close();
  return fileContents;
};

const loadFileFromDirectory = async (dir, filename, defaultReturn = {}) => {
  const existingFileNames = fs.readdirSync(dir);
  const existingFileName = existingFileNames.find(
    (approvedFileName) => approvedFileName.replace('.json', '') === filename.replace('.json', ''),
  );
  if (existingFileName) {
    const file = await readFile(`${dir}/${existingFileName}`);
    return JSON.parse(file);
  }
  logger.debug(`File "${filename}" does not exist in directory "${dir}"`);
  return defaultReturn;
};

const loadAllJsonFilesFromDirectory = async (dir) => {
  if (fs.existsSync(dir)) {
    const files = glob.sync(`${dir}/*.json`);
    const promises = files.map(readFile);
    const fileContentsList = await Promise.all(promises);
    return fileContentsList.map(JSON.parse);
  }
  logger.warn(`Directory does not exist: ${dir}`);
  return [];
};

const fetchFromApi = async (url) => {
  const response = await fetch(url, { method: 'GET' });
  return await toJsonOrThrowError(`Failed to retrieve data from ${url}`)(response);
};

export { fetchFromApi, loadAllJsonFilesFromDirectory, loadFileFromDirectory };
