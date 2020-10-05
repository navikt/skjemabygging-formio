import jsdom from "jsdom";
import fs from "fs";
import { buildDirectoryIndexHtml } from "./context";

const { JSDOM } = jsdom;

export function gitVersionFromIndexHtml(htmlString) {
  const {document} = new JSDOM(htmlString).window;
  const gitVersionMeta = document.querySelector('meta[name="git-version"]');
  return gitVersionMeta.getAttribute('content');
}

export function gitVersionFromBuild() {
  const indexHtml = fs.readFileSync(buildDirectoryIndexHtml);
  return gitVersionFromIndexHtml(indexHtml);
}