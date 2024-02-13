interface HtmlAsJsonTextElement {
  type: 'TextElement';
  textContent: string | null;
}
interface HtmlAsJsonElement {
  type: 'Element';
  tagName: string;
  attributes: Array<[string, string]>;
  children: Array<HtmlAsJsonElement | HtmlAsJsonTextElement>;
}

const htmlString2Json = (htmlString: string): HtmlAsJsonElement => {
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  return JSON.parse(JSON.stringify(Element(div)));
};

const fromNode = (node: ChildNode): HtmlAsJsonElement | HtmlAsJsonTextElement => {
  switch (node?.nodeType) {
    case 1:
      return Element(node as Element);
    case 3:
      return TextElement(node as Element);
    default:
      throw Error(`unsupported nodeType: ${node.nodeType}`);
  }
};

const TextElement = (element: Element): HtmlAsJsonTextElement => ({
  type: 'TextElement',
  textContent: element.textContent,
});

const Element = (element: Element): HtmlAsJsonElement => ({
  type: 'Element',
  tagName: element.tagName,
  attributes: Array.from(element.attributes, ({ name, value }) => [name, value]),
  children: Array.from(element.childNodes, fromNode),
});

const json2HtmlString = (jsonElement: HtmlAsJsonElement, translate?: (texts: string) => string) => {
  return (toNode(jsonElement, translate) as HTMLElement).outerHTML.toString();
};

const toNode = (jsonElement: HtmlAsJsonElement | HtmlAsJsonTextElement, translate?: (text: string) => string) => {
  switch (jsonElement?.type) {
    case 'Element':
      return HtmlNode(jsonElement.tagName, jsonElement.attributes, jsonElement.children, translate);
    case 'TextElement':
      return TextNode(jsonElement.textContent, translate);
    default:
      throw Error('unsupported type: ' + (jsonElement as any)?.type);
  }
};

const TextNode = (text: string | null, translate: (text: string) => string = (text) => text) => {
  return document.createTextNode(translate(text ?? ''));
};

const HtmlNode = (
  tagName: string,
  attributes: Array<[string, string]> = [],
  children: Array<HtmlAsJsonElement | HtmlAsJsonTextElement> = [],
  translate?: (text: string) => string,
) => {
  const htmlElement = document.createElement(tagName);
  for (const [k, v] of attributes) htmlElement.setAttribute(k, v);
  for (const child of children) htmlElement.appendChild(toNode(child, translate));
  return htmlElement;
};

export { htmlString2Json, json2HtmlString };
