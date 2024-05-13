import DOMPurify from 'dompurify';
import { HtmlAsJsonElement, HtmlAsJsonTextElement } from './htmlAsJson';
import { fromElement, toNode } from './htmlNode';

/**
 * Regex matches that there is an html-tag in the string,
 * excluding the <br>-tag (with possible whitespace and self-closing "/").
 */
const isHtmlString = (text: string) => /<(?!br\s*\/?)[^>]+>/gm.test(text);

const htmlString2Json = (htmlString: string): HtmlAsJsonElement => {
  const sanitizedHtmlString = DOMPurify.sanitize(htmlString);
  const div = document.createElement('div');
  div.innerHTML = sanitizedHtmlString;
  return JSON.parse(JSON.stringify(fromElement(div)));
};

const json2HtmlString = (jsonElement: HtmlAsJsonElement | HtmlAsJsonTextElement): string => {
  switch (jsonElement?.type) {
    case 'Element':
      const htmlElement = toNode(jsonElement) as HTMLElement;
      return htmlElement.outerHTML.toString();
    case 'TextElement':
      return jsonElement.textContent ?? '';
    default:
      throw Error('unsupported type: ' + (jsonElement as any)?.type);
  }
};

export { htmlString2Json, isHtmlString, json2HtmlString };
