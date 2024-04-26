const defaultLeafs: AcceptedTag[] = ['P', 'H3', 'LI'];
const acceptedTags = ['P', 'H3', 'LI', 'OL', 'UL', 'A', 'B', 'STRONG'] as const;
type AcceptedTag = (typeof acceptedTags)[number];

const isAcceptedTag = (tag: string): tag is AcceptedTag => {
  return ([...acceptedTags] as string[]).includes(tag);
};

interface HtmlAsJsonTextElement {
  id?: string;
  type: 'TextElement';
  textContent: string | null;
}

interface HtmlAsJsonElement {
  id?: string;
  type: 'Element';
  tagName: string;
  attributes: Array<[string, string]>;
  children: Array<HtmlAsJsonElement | HtmlAsJsonTextElement>;
}

const getChild = (htmlAsJson: HtmlAsJsonElement | HtmlAsJsonTextElement | undefined, index: number) =>
  htmlAsJson?.type === 'Element' && htmlAsJson.children.length > index ? htmlAsJson.children[index] : undefined;

export { acceptedTags, defaultLeafs, getChild, isAcceptedTag };
export type { AcceptedTag, HtmlAsJsonElement, HtmlAsJsonTextElement };
