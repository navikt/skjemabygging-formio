import { AcceptedTag, HtmlAsJsonElement, HtmlAsJsonTextElement } from '../htmlAsJson';

const jsonElement = (
  tagName: AcceptedTag | 'DIV',
  children: Array<HtmlAsJsonElement | HtmlAsJsonTextElement>,
  attributes = [],
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

export { jsonElement, jsonTextElement };
