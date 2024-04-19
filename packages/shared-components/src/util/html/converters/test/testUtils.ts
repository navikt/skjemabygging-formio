import { AcceptedTag, HtmlAsJsonElement, HtmlAsJsonTextElement } from '../htmlAsJson';

const jsonElement = (
  id: string,
  tagName: AcceptedTag | 'DIV',
  children: Array<HtmlAsJsonElement | HtmlAsJsonTextElement>,
  isWrapper = false,
  attributes = [],
): HtmlAsJsonElement => ({
  id,
  type: 'Element',
  tagName,
  attributes,
  isWrapper,
  children,
});

const jsonTextElement = (id: string, textContent: string): HtmlAsJsonTextElement => ({
  id,
  type: 'TextElement',
  textContent,
});

export { jsonElement, jsonTextElement };
