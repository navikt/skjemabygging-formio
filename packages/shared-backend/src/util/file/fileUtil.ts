import fs from 'node:fs';
import { logger } from '../../shared/logger/logger';

const readFile = async (filepath: string) => {
  const fileHandle = await fs.promises.open(filepath, 'r');
  const fileContents = await fileHandle.readFile({ encoding: 'utf-8' });
  await fileHandle.close();
  return fileContents;
};

const loadJsonFileFromDirectory = async (dir?: string, filename?: string) => {
  if (dir && filename) {
    const existingFileNames = fs.readdirSync(dir);
    const existingFileName = existingFileNames.find(
      (approvedFileName) => approvedFileName.replace('.json', '') === filename.replace('.json', ''),
    );
    if (existingFileName) {
      const file = await readFile(`${dir}/${existingFileName}`);
      return JSON.parse(file);
    }
  }

  logger.debug(`File "${filename}" does not exist in directory "${dir}"`);
};

const loadAllJsonFilesFromDirectory = async (dir?: string) => {
  if (dir && fs.existsSync(dir)) {
    const files = fs
      .readdirSync(dir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => `${dir}/${file}`);
    const promises = files.map(readFile);
    const fileContentsList = await Promise.all(promises);
    return fileContentsList.map((content) => JSON.parse(content));
  }
  logger.warn(`Directory does not exist: ${dir}`);
  return [];
};

const fileUtil = {
  loadAllJsonFilesFromDirectory,
  loadJsonFileFromDirectory,
};

export default fileUtil;
