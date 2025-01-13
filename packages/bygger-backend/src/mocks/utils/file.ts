import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../../logging/logger';

const resolveMocksBaseDir = () => {
  const baseDir = process.env.MOCKS_BASE_DIR || '../';
  const filename = fileURLToPath(import.meta.url);
  const dirname = path.dirname(filename);
  return path.join(dirname, baseDir);
};
export const mocksBaseDir = resolveMocksBaseDir();
logger.info(`mocksBaseDir=${mocksBaseDir}`);

export const fileLoader =
  (dataDir: string) =>
  async (name: string, extension: string = 'json') => {
    const filePath = `${mocksBaseDir}/${dataDir}/${name}.${extension}`;
    logger.info(`[MSW] Loading ${filePath}`);
    let json: any = undefined;
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      json = JSON.parse(fileContent);
    } catch (_e) {
      logger.info(`[MSW] File does not exist: ${filePath}`);
    }
    return json;
  };
