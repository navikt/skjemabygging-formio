import { HtmlAsJsonElement } from '../htmlAsJson';
import { fromNode } from './htmlNode';
import { htmlString2Json, json2HtmlString } from './htmlString';

const strongMarkdown2HtmlString = (markdown: string, tag: 'B' | 'STRONG' = 'STRONG') => {
  const captureRegex = /\*{2}([^*]*)\*{2}/;
  const captures = captureRegex.exec(markdown);
  if (captures) {
    const innerText = captures[1];
    return tag === 'B' ? `<b>${innerText}</b>` : `<strong>${innerText}</strong>`;
  }
  return markdown;
};

const linkMarkdown2HtmlString = (markdown: string): string => {
  const captureRegex = /\[([^[]+)\]\(([^[]+)\)/;

  const captures = captureRegex.exec(markdown);
  if (captures) {
    const text = captures[1];
    const url = captures[2];

    return `<a href=${url}>${text}</a>`;
  }
  return markdown;
};

const markdown2Json = (markdown: string): HtmlAsJsonElement => {
  const markdownLinkRegex = /\[[^[]+\]\([^[]+\)/gm;
  const markdownStrongRegex = /\*{2}[^*]*\*{2}/gm;

  let htmlString = markdown;

  const linkMatches = markdown.match(markdownLinkRegex);

  if (linkMatches) {
    linkMatches.forEach((match) => {
      const aTag = linkMarkdown2HtmlString(match);
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

  return htmlString2Json(htmlString);
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

const markdownFromHtmlNodes = (nodes: Array<Element | Text>): string => {
  return Array.from(nodes, htmlNode2Markdown).join('');
};

export { htmlNode2Markdown, linkMarkdown2HtmlString, markdown2Json, markdownFromHtmlNodes, strongMarkdown2HtmlString };
