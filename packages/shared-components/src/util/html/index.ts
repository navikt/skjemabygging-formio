import { HtmlAsJsonElement, HtmlAsJsonTextElement, htmlString2Json, json2HtmlString } from './converters';
import { isHtmlString, translateHtml } from './translate';

const htmlUtils = {
  isHtmlString,
  translateHtml,
  htmlString2Json,
  json2HtmlString,
};

export type { HtmlAsJsonElement, HtmlAsJsonTextElement };
export default htmlUtils;
