/**
 * The array defaultLeafs is used to define tags which we expect to only contain children that are either
 * text or html tags that supports markdown conversion (like <a> and <strong>)
 *
 * The arrays acceptedTags and defaultLeafs may need to be changed if we redefine what tags are allowed in the ckeditor,
 * otherwise tags may appear as plain text where we are using these converters
 * */
const defaultLeafTags = ['P', 'H3', 'H4', 'LI'] as const;
const acceptedTags = [...defaultLeafTags, 'OL', 'UL'] as const;
type AcceptedTag = (typeof acceptedTags)[number];

const isAcceptedTag = (tag: string): tag is AcceptedTag => {
  return ([...acceptedTags] as string[]).includes(tag);
};

const generateMarkdown = (node: Element | ChildNode): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;

    switch (element.tagName) {
      case 'STRONG':
      case 'B': {
        const boldText = Array.from(element.childNodes, generateMarkdown).join('');
        return boldText ? `**${boldText}**` : '';
      }
      case 'A': {
        const linkText = Array.from(element.childNodes, generateMarkdown).join('');
        const url = element.getAttribute('href');
        return linkText || url ? `[${linkText}](${url})` : '';
      }
      case 'SPAN': {
        return Array.from(element.childNodes, generateMarkdown).join('');
      }
      default:
        if (isAcceptedTag(element.tagName)) {
          const textContent = Array.from(element.childNodes, generateMarkdown).join('');
          return `<${element.tagName.toLowerCase()}>${textContent}</${element.tagName.toLowerCase()}>`;
        }
        return element.outerHTML;
    }
  }
  return '';
};

export { defaultLeafTags, generateMarkdown };
