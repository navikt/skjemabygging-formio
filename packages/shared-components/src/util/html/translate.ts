import { htmlString2Json, json2HtmlString } from './converters';

const isHtmlString = (text: string) => /<[^>]*>/.test(text);
const translateHtml = (htmlString: string, translate: (text: string) => string) => {
  if (!isHtmlString(htmlString)) {
    return translate(htmlString);
  }
  return json2HtmlString(htmlString2Json(htmlString), translate);
};

export { isHtmlString, translateHtml };
