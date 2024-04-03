import { HtmlAsJsonElement, HtmlAsJsonTextElement } from '../htmlAsJson';
import { fromNode } from './htmlNode';
import { htmlString2Json, json2HtmlString } from './htmlString';

const linkMarkdown2HtmlString = (
  markdown: string,
  originalATag?: HtmlAsJsonElement | HtmlAsJsonTextElement,
): string => {
  const captureRegex = /\[([^[]+)\]\(([^[]+)\)/;

  const captures = captureRegex.exec(markdown);
  if (captures) {
    const text = captures[1];
    const url = captures[2];

    if (originalATag) {
      const originalCopy = JSON.parse(JSON.stringify(originalATag));
      originalCopy.attributes = [...originalCopy.attributes, ['href', url]];
      // FIXME: only supports <a> with one child
      // console.log('Original A-tag', originalCopy, originalATag);
      originalCopy.children = [{ ...originalCopy.children[0], textContent: text }];
      return json2HtmlString(originalCopy);
    }
    return `<a href=${url}>${text}</a>`;
  }
  return markdown;
};

const strongMarkdown2HtmlString = (markdown: string) => {
  const captureRegex = /\*{2}([^*]*)\*{2}/;
  const captures = captureRegex.exec(markdown);
  if (captures) {
    const innerText = captures[1];
    // We don't care if the original uses a b-tag, since strong is used as default in the wysiwyg-editor
    //TODO use the exisisting html-creator-functionality?
    return `<strong>${innerText}</strong>`;
  }
  return markdown;
};

const markdown2Json = (
  markdown: string,
  original: HtmlAsJsonTextElement,
): HtmlAsJsonElement | HtmlAsJsonTextElement => {
  const markdownLinkRegex = /\[[^[]+\]\([^[]+\)/gm;
  const markdownStrongRegex = /\*{2}[^*]*\*{2}/gm;

  let htmlString = markdown;

  const linkMatches = markdown.match(markdownLinkRegex);

  if (linkMatches) {
    linkMatches.forEach((match, index) => {
      const originalATag = original.htmlContentAsJson?.filter(
        (element) => element.type === 'Element' && element.tagName === 'A',
      )?.[index];
      const aTag = linkMarkdown2HtmlString(match, originalATag);
      htmlString = htmlString.replace(match, aTag);
    });
  }

  const strongMatches = htmlString.match(markdownStrongRegex);
  if (strongMatches) {
    strongMatches.forEach((match) => {
      const strongTag = strongMarkdown2HtmlString(match);
      htmlString = htmlString.replace(match, strongTag);
    });
  }
  if (linkMatches || strongMatches) {
    return htmlString2Json(htmlString);
  }
  return { ...original, textContent: markdown };
};

const htmlNode2Markdown = (node: Element | ChildNode): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    switch (element.tagName) {
      case 'P':
      case 'H3':
      case 'OL':
      case 'UL':
      case 'LI':
        // console.log(element.tagName, element.childNodes);
        return Array.from(element.childNodes, htmlNode2Markdown).join('');
      case 'STRONG':
      case 'B':
        return `**${Array.from(element.childNodes, htmlNode2Markdown).join('')}**`;
      case 'A':
        return `[${Array.from(element.childNodes, htmlNode2Markdown).join('')}](${element.getAttribute('href')})`;
      default:
        return json2HtmlString(fromNode(element, []));
    }
  }
  return '';
};

export { htmlNode2Markdown, markdown2Json };
