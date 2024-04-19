import { HtmlAsJsonElement, HtmlAsJsonTextElement, defaultLeafs, getChild } from './htmlAsJson';
import { fromNode, toNode } from './htmlNode';
import { htmlString2Json, isHtmlString, json2HtmlString } from './htmlString';
import {
  htmlNode2Markdown,
  linkMarkdown2HtmlString,
  markdown2Json,
  markdownFromHtmlNodes,
  strongMarkdown2HtmlString,
} from './markdown';

const htmlConverter = {
  htmlNode2Markdown,
  linkMarkdown2HtmlString,
  strongMarkdown2HtmlString,
  fromNode,
  toNode,
  isHtmlString,
  getChild,
  htmlString2Json,
  json2HtmlString,
  markdown2Json,
  markdownFromHtmlNodes,
};

export { defaultLeafs };
export type { HtmlAsJsonElement, HtmlAsJsonTextElement };
export default htmlConverter;
