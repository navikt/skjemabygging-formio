import { AcceptedTag, HtmlAsJsonElement, HtmlAsJsonTextElement } from '../htmlAsJson';

const jsonElement = (
  tagName: AcceptedTag | 'DIV',
  children: Array<HtmlAsJsonElement | HtmlAsJsonTextElement>,
  isWrapper = false,
  attributes = [],
): HtmlAsJsonElement => ({
  type: 'Element',
  tagName,
  attributes,
  isWrapper,
  children,
});

const jsonTextElement = (textContent: string): HtmlAsJsonTextElement => ({
  type: 'TextElement',
  textContent,
});

export { jsonElement, jsonTextElement };
