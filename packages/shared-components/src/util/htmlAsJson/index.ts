import HtmlElement, { HtmlObject, HtmlTextElement } from './HtmlObject';
import { fromNode, toNode } from './converters/htmlNode';
import { htmlString2Json, isHtmlString, json2HtmlString } from './converters/htmlString';
import { markdown2Json } from './converters/markdown';
import { HtmlAsJsonElement, HtmlAsJsonTextElement, defaultLeafs, getChild } from './htmlAsJson';

const htmlAsJsonUtils = {
  fromNode,
  toNode,
  isHtmlString,
  getChild,
  htmlString2Json,
  json2HtmlString,
  markdown2Json,
  defaultLeafs,
};

export { HtmlElement, HtmlObject, HtmlTextElement };
export type { HtmlAsJsonElement, HtmlAsJsonTextElement };
export default htmlAsJsonUtils;
