import { htmlUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { HtmlAsJsonElement, HtmlAsJsonTextElement } from './htmlAsJson';
import { fromElement, toNode } from './htmlNode';

/*
 * Sanitize happens twice because of a known issue with dompurify that reverses the order of attributes
 * See: https://github.com/cure53/DOMPurify/issues/276
 */

const htmlString2Json = (htmlString: string): HtmlAsJsonElement => {
  const sanitizedHtmlString = htmlUtils.sanitizeHtmlString(htmlString);
  const div = document.createElement('div');
  div.innerHTML = sanitizedHtmlString;
  return JSON.parse(JSON.stringify(fromElement(div)));
};

const json2HtmlString = (jsonElement: HtmlAsJsonElement | HtmlAsJsonTextElement): string => {
  switch (jsonElement?.type) {
    case 'Element': {
      const htmlElement = toNode(jsonElement) as HTMLElement;
      return htmlElement.tagName === 'DIV' ? htmlElement.innerHTML.toString() : htmlElement.outerHTML.toString();
    }
    case 'TextElement':
      return jsonElement.textContent ?? '';
    default:
      throw Error('unsupported type: ' + (jsonElement as any)?.type);
  }
};

export { htmlString2Json, json2HtmlString };
