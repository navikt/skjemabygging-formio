import {
  HtmlAsJsonElement,
  HtmlAsJsonTextElement,
  htmlString2Json,
  isHtmlString,
  json2HtmlString,
  markDown2Json,
} from './converters';

const htmlUtils = {
  isHtmlString,
  htmlString2Json,
  json2HtmlString,
  markDown2Json,
};

export type { HtmlAsJsonElement, HtmlAsJsonTextElement };
export default htmlUtils;
