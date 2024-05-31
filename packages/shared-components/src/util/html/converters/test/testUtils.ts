import { AcceptedTag, HtmlAsJsonElement, HtmlAsJsonTextElement } from '../htmlAsJson';

const jsonElement = (
  tagName: AcceptedTag | 'DIV',
  children: Array<HtmlAsJsonElement | HtmlAsJsonTextElement>,
  attributes: [string, string][] = [],
): HtmlAsJsonElement => ({
  type: 'Element',
  tagName,
  attributes,
  children,
});

const jsonTextElement = (textContent: string): HtmlAsJsonTextElement => ({
  type: 'TextElement',
  textContent,
});

const TextNode = (textContent: string) => ({ nodeType: Node.TEXT_NODE, textContent }) as ChildNode;
const ElementNode = (tagName: string, children: ChildNode[]) =>
  ({
    nodeType: Node.ELEMENT_NODE,
    tagName,
    nodeName: tagName,
    childNodes: children,
    attributes: [],
  }) as unknown as ChildNode;

const Element = (tagName: string, children: Array<ChildNode>, href?: string) =>
  ({
    nodeType: Node.ELEMENT_NODE,
    tagName,
    childNodes: children as unknown as NodeListOf<ChildNode>,
    attributes: href ? [{ name: 'href', value: href }] : ([] as unknown as NamedNodeMap),
    getAttribute: (qualifiedName: string) => (qualifiedName === 'href' ? href : null),
  }) as Element;

export { Element, ElementNode, TextNode, jsonElement, jsonTextElement };
