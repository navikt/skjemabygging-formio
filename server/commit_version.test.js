import {gitVersionFromIndexHtml} from "./commit_version";
import fs from 'fs';
import path from 'path';

import child_process from 'child_process';

const htmlDocWithVersion = (version) => `
  <!doctype html>
<html lang="nb-NO">
<head>
    <meta charset="utf-8"/>
    <link rel="icon" href="/skjema/favicon.ico"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <meta name="theme-color" content="#000000"/>
    <meta name="description" content="Web site created using create-react-app"/>
    <meta name="git-version" content="${version}"/>
    <link rel="manifest" href="/skjema/manifest.json"/>
    <link rel="shortcut icon" href="/skjema/favicon.ico"/>
    {{{STYLES}}}<title>Skjema - www.nav.no</title>
    <link href="/skjema/static/css/2.82c24f42.chunk.css" rel="stylesheet">
</head>
<body>
Brødteksten kom hit gitt
</body>
</html>
  `;

it("parses built index.html and extracts the git commit", () => {
  const htmlString = htmlDocWithVersion('flesk')
  const version = gitVersionFromIndexHtml(htmlString)
  expect(version).toEqual('flesk');
});

async function getGitVersion() {
  return new Promise((resolve, reject) => {
    child_process.exec("git describe --always --dirty",
      (error, stdout, stderr) => resolve(stdout.trim()));
  });
}

it('finds index.html from the build folder and uses that', async () => {
  const currentGitVersion = await getGitVersion();
  const buildDirectoryIndexHtml = path.join(__dirname, '../build/index.html');
  const html = fs.readFileSync(buildDirectoryIndexHtml);
  const version = gitVersionFromIndexHtml(html);
  expect(currentGitVersion).toEqual(version);
});