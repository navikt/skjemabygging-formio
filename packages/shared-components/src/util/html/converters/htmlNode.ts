import { HtmlAsJsonElement, HtmlAsJsonTextElement, isAcceptedTag } from './htmlAsJson';
import { json2HtmlString } from './htmlString';

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

const fromNode = (node: ChildNode): HtmlAsJsonElement | HtmlAsJsonTextElement => {
  if (node?.nodeType === Node.TEXT_NODE && node.textContent) {
    return fromTextContent(node.textContent);
  } else if (node?.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    if (isAcceptedTag(element.tagName)) {
      return fromElement(element);
    }
    return fromTextContent(json2HtmlString(fromElement(element)));
  }
  throw Error(`unsupported nodeType: ${node.nodeType}`);
};

const fromTextContent = (textContent: string, parentElement?: Element): HtmlAsJsonTextElement => {
  const htmlContentAsJson = parentElement
    ? Array.from(parentElement.childNodes, (childNode) => fromNode(childNode))
    : undefined;
  return {
    type: 'TextElement',
    textContent,
    htmlContentAsJson,
  };
};

const fromElement = (element: Element, isWrapper?: boolean): HtmlAsJsonElement => {
  return {
    type: 'Element',
    tagName: element.tagName,
    attributes: Array.from(element.attributes, ({ name, value }) => [name, value]),
    isWrapper: !!isWrapper,
    children: Array.from(element.childNodes, (childNode) => fromNode(childNode)),
  };
};

export { fromElement, fromNode, toNode };
