import fs from 'node:fs';

const basePath = process.argv[2];
const excludedFolders = new Set(process.argv.slice(3));

function getFolders(basePath, excludedFolders = new Set()) {
  return fs
    .readdirSync(basePath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .filter(({ name }) => !excludedFolders.has(name))
    .map(({ name }) => name);
}

const folders = getFolders(basePath, excludedFolders);
console.log(JSON.stringify(folders));
