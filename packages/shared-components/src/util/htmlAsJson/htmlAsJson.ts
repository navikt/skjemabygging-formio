interface HtmlAsJsonTextElement {
  id: string;
  type: 'TextElement';
  textContent: string | null;
  // If textContent is a result of several elements being combined, e.g. as markdown, htmlContentAsJson wil store the generated html structure for structural memory
  htmlContentAsJson?: Array<HtmlAsJsonElement | HtmlAsJsonTextElement>;
}

const acceptedTags = ['P', 'H3', 'LI', 'OL', 'UL', 'A', 'B', 'STRONG'];
type AcceptedTag = (typeof acceptedTags)[number];

interface HtmlAsJsonElement {
  id: string;
  type: 'Element';
  tagName: string;
  attributes: Array<[string, string]>;
  children: Array<HtmlAsJsonElement | HtmlAsJsonTextElement>;
  // Used to keep track of wrapping div, which is used to support htmlStrings with multiple tags on the top level
  isWrapper: boolean;
}

const getChild = (htmlAsJson: HtmlAsJsonElement | HtmlAsJsonTextElement | undefined, index: number) =>
  htmlAsJson?.type === 'Element' && htmlAsJson.children.length > index ? htmlAsJson.children[index] : undefined;

export { acceptedTags, getChild };
export type { AcceptedTag, HtmlAsJsonElement, HtmlAsJsonTextElement };
