import { HtmlAsJsonElement, HtmlAsJsonTextElement, defaultLeaves, getChild } from './htmlAsJson';
import { toNode } from './htmlNode';
import { htmlString2Json, removeEmptyTags, sanitizeHtmlString } from './htmlString';
import { htmlNode2Markdown, markdown2Json } from './markdown';

const htmlConverter = {
  defaultLeaves,
  removeEmptyTags,
  sanitizeHtmlString,
  htmlNode2Markdown,
  toNode,
  getChild,
  htmlString2Json,
  markdown2Json,
};

export type { HtmlAsJsonElement, HtmlAsJsonTextElement };
export default htmlConverter;
