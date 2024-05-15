import DOMPurify from 'dompurify';
import { HtmlAsJsonElement, HtmlAsJsonTextElement } from './htmlAsJson';
import { fromElement, toNode } from './htmlNode';

type SanitizeOptions = Omit<DOMPurify.Config, 'RETURN_DOM_FRAGMENT' | 'RETURN_DOM'>;

/**
 * Regex matches that there is an html-tag in the string,
 * excluding the <br>-tag (with possible whitespace and self-closing "/").
 */
const isHtmlString = (text: string) => /<(?!br\s*\/?)[^>]+>/gm.test(text);

/*
 * Sanitize happens twice because of a known issue with dompurify that reverses the order of attributes
 * See: https://github.com/cure53/DOMPurify/issues/276
 */
const sanitizeHtmlString = (htmlString: string, options?: SanitizeOptions): string => {
  const defaultOptions: SanitizeOptions = { ADD_ATTR: ['target'] };
  const sanitizeOptions = { ...defaultOptions, ...options };
  return DOMPurify.sanitize(DOMPurify.sanitize(htmlString, sanitizeOptions), sanitizeOptions);
};

const htmlString2Json = (htmlString: string): HtmlAsJsonElement => {
  const sanitizedHtmlString = sanitizeHtmlString(htmlString);
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

export { htmlString2Json, isHtmlString, json2HtmlString, sanitizeHtmlString };
