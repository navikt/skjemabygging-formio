import { HtmlAsJsonElement, HtmlAsJsonTextElement } from './htmlAsJson';
import { fromElement, toNode } from './htmlNode';

const isHtmlString = (text: string) => /<[^>]*>/.test(text);

const htmlString2Json = (htmlString: string): HtmlAsJsonElement => {
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  return JSON.parse(JSON.stringify(fromElement(div, true)));
};

const json2HtmlString = (jsonElement: HtmlAsJsonElement | HtmlAsJsonTextElement): string => {
  switch (jsonElement?.type) {
    case 'Element':
      const htmlElement = toNode(jsonElement) as HTMLElement;
      return jsonElement.isWrapper ? htmlElement.innerHTML.toString() : htmlElement.outerHTML.toString();
    case 'TextElement':
      return jsonElement.textContent ?? '';
    default:
      throw Error('unsupported type: ' + (jsonElement as any)?.type);
  }
};

export { htmlString2Json, isHtmlString, json2HtmlString };
