/**
 * The array defaultLeafs is used to define tags which we expect to only contain children that are either
 * text or html tags that supports markdown conversion (like <a> and <strong>)
 *
 * The arrays acceptedTags and defaultLeafs may need to be changed if we redefine what tags are allowed in the ckeditor,
 * otherwise tags may appear as plain text where we are using these converters
 * */
const defaultLeaves: AcceptedTag[] = ['H3', 'H4', 'P', 'LI'];
const acceptedTags = ['P', 'H3', 'H4', 'LI', 'OL', 'UL', 'A', 'B', 'STRONG'] as const;
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

export { acceptedTags, defaultLeaves, getChild, isAcceptedTag };
export type { AcceptedTag, HtmlAsJsonElement, HtmlAsJsonTextElement };
