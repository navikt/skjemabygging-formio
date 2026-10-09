import path from 'path';
import { fileURLToPath } from 'url';

const isTest = process.env.NODE_ENV === 'test';
const dirname = path.dirname(fileURLToPath(import.meta.url));

export const buildDirectory =
  process.env.SENDINN_BUILD_DIR || path.join(dirname, isTest ? './testdata-views' : '../build');
