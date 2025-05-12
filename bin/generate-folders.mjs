import fs from 'node:fs';

const basePath = process.argv[2];

function getFolders(basePath) {
  return fs
    .readdirSync(basePath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map(({ name }) => `cypress/e2e/${name}`);
}

const folders = getFolders(basePath);
console.log(JSON.stringify(folders));
