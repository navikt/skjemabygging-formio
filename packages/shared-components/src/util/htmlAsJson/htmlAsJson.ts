interface HtmlAsJsonTextElement {
  id: string;
  type: 'TextElement';
  textContent: string | null;
  // If textContent is a result of several elements being combined, e.g. as markdown, htmlContentAsJson wil store the generated html structure for structural memory
  htmlContentAsJson?: Array<HtmlAsJsonElement | HtmlAsJsonTextElement>;
}

const defaultLeafs: AcceptedTag[] = ['P', 'H3', 'LI'];
const acceptedTags = ['P', 'H3', 'LI', 'OL', 'UL', 'A', 'B', 'STRONG'] as const;
type AcceptedTag = (typeof acceptedTags)[number];

interface HtmlAsJsonElement {
  id: string;
  type: 'Element';
  tagName: string;
  attributes: Array<[string, string]>;
  children: Array<HtmlAsJsonElement | HtmlAsJsonTextElement>;
  // isWrapper is true if this is an outer wrapping div, which is used to support htmlStrings with multiple tags on the top level
  isWrapper: boolean;
}

const getChild = (htmlAsJson: HtmlAsJsonElement | HtmlAsJsonTextElement | undefined, index: number) =>
  htmlAsJson?.type === 'Element' && htmlAsJson.children.length > index ? htmlAsJson.children[index] : undefined;

export { acceptedTags, defaultLeafs, getChild };
export type { AcceptedTag, HtmlAsJsonElement, HtmlAsJsonTextElement };
