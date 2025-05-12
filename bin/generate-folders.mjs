import fs from 'node:fs';
import path from 'node:path';

const basePath = process.argv[2];

function getFolders(basePath) {
  return fs
    .readdirSync(basePath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.join(basePath, dirent.name));
}

const folders = getFolders(basePath);
console.log(JSON.stringify(folders));
