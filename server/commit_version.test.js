import { gitVersionFromIndexHtml } from "./commit_version";
import fs from "fs";
import path from "path";

import child_process from "child_process";

const htmlDocWithVersion = (version) => `
<!doctype html>
  <html lang="nb-NO">
  <head>
    <meta charset="utf-8"/>
    <meta name="git-version" content="${version}"/>
  </head>
  <body>
    Brødteksten kom hit gitt
  </body>
</html>
  `;

it("parses built index.html and extracts the git commit", () => {
  const htmlString = htmlDocWithVersion("flesk");
  const version = gitVersionFromIndexHtml(htmlString);
  expect(version).toEqual("flesk");
});

async function getGitVersion() {
  return new Promise((resolve, reject) => {
    child_process.exec("git describe --always --match 'NOT A TAG' --abbrev=0 --dirty", (error, stdout, stderr) => resolve(stdout.trim()));
  });
}

it("finds index.html from the build folder and uses that", async () => {
  if (!process.env.CI) {
    // this test will very often fail when developing as it depends on the run build
    // being up to date
    return;
  }
  const currentGitVersion = await getGitVersion();
  const buildDirectoryIndexHtml = path.join(__dirname, "../build/index.html");
  const html = fs.readFileSync(buildDirectoryIndexHtml);
  const version = gitVersionFromIndexHtml(html);
  expect(currentGitVersion).toEqual(version);
});
