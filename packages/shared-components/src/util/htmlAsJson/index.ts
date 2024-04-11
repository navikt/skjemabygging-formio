import HtmlElement, { HtmlObject, HtmlTextElement } from './HtmlObject';
import { fromNode, toNode } from './converters/htmlNode';
import { htmlString2Json, isHtmlString, json2HtmlString } from './converters/htmlString';
import {
  htmlNode2Markdown,
  linkMarkdown2HtmlString,
  markdown2Json,
  markdownFromHtmlNodes,
  strongMarkdown2HtmlString,
} from './converters/markdown';
import { HtmlAsJsonElement, HtmlAsJsonTextElement, defaultLeafs, getChild } from './htmlAsJson';

const htmlAsJsonUtils = {
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
  defaultLeafs,
};

export { HtmlElement, HtmlObject, HtmlTextElement };
export type { HtmlAsJsonElement, HtmlAsJsonTextElement };
export default htmlAsJsonUtils;
