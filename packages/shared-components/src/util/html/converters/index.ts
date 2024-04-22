import { HtmlAsJsonElement, HtmlAsJsonTextElement, defaultLeafs, getChild } from './htmlAsJson';
import { toNode } from './htmlNode';
import { htmlString2Json, isHtmlString } from './htmlString';
import { htmlNode2Markdown, markdown2Json } from './markdown';

const htmlConverter = {
  htmlNode2Markdown,
  toNode,
  isHtmlString,
  getChild,
  htmlString2Json,
  markdown2Json,
};

export { defaultLeafs };
export type { HtmlAsJsonElement, HtmlAsJsonTextElement };
export default htmlConverter;
