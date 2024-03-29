import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
export const buildDirectory = path.join(dirname, process.env.BYGGER_BUILD_DIR || '../build');
export const buildDirectoryIndexHtml = path.join(buildDirectory, 'index.html');
