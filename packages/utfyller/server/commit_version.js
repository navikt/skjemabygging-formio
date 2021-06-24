import jsdom from "jsdom";

const {JSDOM} = jsdom;

export function gitVersionFromIndexHtml(htmlString) {
  const {document} = new JSDOM(htmlString).window;
  const gitVersionMeta = document.querySelector('meta[name="git-version"]');
  return gitVersionMeta.getAttribute('content');
}
