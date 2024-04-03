import { AcceptedTag, acceptedTags, HtmlAsJsonElement, HtmlAsJsonTextElement } from '../htmlAsJson';
import { json2HtmlString } from './htmlString';
import { htmlNode2Markdown } from './markdown';

const toNode = (jsonElement: HtmlAsJsonElement | HtmlAsJsonTextElement) => {
  switch (jsonElement?.type) {
    case 'Element':
      return createHtmlNode(jsonElement.tagName, jsonElement.attributes, jsonElement.children);
    case 'TextElement':
      return createTextNode(jsonElement.textContent);
    default:
      throw Error('unsupported type: ' + (jsonElement as any)?.type);
  }
};

const createTextNode = (text: string | null) => {
  return document.createTextNode(text ?? '');
};

const createHtmlNode = (
  tagName: string,
  attributes: Array<[string, string]> = [],
  children: Array<HtmlAsJsonElement | HtmlAsJsonTextElement> = [],
) => {
  const htmlElement = document.createElement(tagName);
  for (const [k, v] of attributes) htmlElement.setAttribute(k, v);
  for (const child of children) htmlElement.appendChild(toNode(child));
  return htmlElement;
};

const fromNode = (node: ChildNode, skipConversionWithin: AcceptedTag[]): HtmlAsJsonElement | HtmlAsJsonTextElement => {
  if (node?.nodeType === Node.TEXT_NODE && node.textContent) {
    return fromTextContent(node.textContent);
  } else if (node?.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    if (acceptedTags.includes(element.tagName)) {
      return fromElement(element, skipConversionWithin);
    }
    return fromTextContent(json2HtmlString(fromElement(element, skipConversionWithin)));
  }
  throw Error(`unsupported nodeType: ${node.nodeType}`);
};

const fromTextContent = (textContent: string, parentElement?: Element): HtmlAsJsonTextElement => {
  const htmlContentAsJson = parentElement
    ? Array.from(parentElement.childNodes, (childNode) => fromNode(childNode, []))
    : undefined;
  return {
    id: textContent.replaceAll(' ', ''),
    type: 'TextElement',
    textContent,
    htmlContentAsJson,
  };
};

const fromElement = (
  element: Element,
  skipConversionWithinTags: AcceptedTag[],
  isWrapper?: boolean,
): HtmlAsJsonElement => {
  const convertChildrenToText = (skipConversionWithinTags as string[]).includes(element.tagName);
  return {
    id: element.textContent!.replaceAll(' ', ''),
    type: 'Element',
    tagName: element.tagName,
    attributes: Array.from(element.attributes, ({ name, value }) => [name, value]),
    isWrapper: !!isWrapper,
    children: convertChildrenToText
      ? [fromTextContent(Array.from(element.childNodes, htmlNode2Markdown).join(''), element)]
      : Array.from(element.childNodes, (childNode) => fromNode(childNode, skipConversionWithinTags)),
  };
};

export { fromElement, fromNode, toNode };
