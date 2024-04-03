import { htmlString2Json, isHtmlString, json2HtmlString } from './converters/htmlString';
import { markdown2Json } from './converters/markdown';
import { HtmlAsJsonElement, HtmlAsJsonTextElement, getChild } from './htmlAsJson';

const htmlAsJsonUtils = {
  isHtmlString,
  getChild,
  htmlString2Json,
  json2HtmlString,
  markdown2Json,
};

export type { HtmlAsJsonElement, HtmlAsJsonTextElement };
export default htmlAsJsonUtils;
