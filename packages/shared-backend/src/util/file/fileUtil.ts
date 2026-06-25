import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import fs, { openAsBlob } from 'node:fs';
import { realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { logger } from '../../shared/logger/logger';

const uploadTempDirectory = path.resolve(tmpdir());

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

const createBlobFromUploadedFile = async (file: Pick<Express.Multer.File, 'buffer' | 'mimetype' | 'path'>) => {
  if (file.path) {
    const resolvedUploadTempDirectory = await realpath(uploadTempDirectory);
    const resolvedFilePath = await realpath(path.resolve(file.path));
    const relativeFilePath = path.relative(resolvedUploadTempDirectory, resolvedFilePath);
    if (relativeFilePath.startsWith('..') || path.isAbsolute(relativeFilePath)) {
      throw new ResponseError('BAD_REQUEST', 'Invalid temporary upload path');
    }

    return await openAsBlob(resolvedFilePath, { type: file.mimetype });
  }

  if (!file.buffer) {
    throw new ResponseError('BAD_REQUEST', 'No file in request');
  }

  return new Blob([Uint8Array.from(file.buffer)], { type: file.mimetype });
};

const fileUtil = {
  createBlobFromUploadedFile,
  loadAllJsonFilesFromDirectory,
  loadJsonFileFromDirectory,
};

export default fileUtil;
