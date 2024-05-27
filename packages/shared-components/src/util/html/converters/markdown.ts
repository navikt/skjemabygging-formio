import { HtmlAsJsonElement, isAcceptedTag } from './htmlAsJson';
import { fromNode } from './htmlNode';
import { htmlString2Json, json2HtmlString } from './htmlString';

const strongMarkdown2HtmlString = (markdown: string) => {
  const strongMarkdownCaptureRegex = /^\*{2}([^*]+)\*{2}$/;
  const captures = strongMarkdownCaptureRegex.exec(markdown);
  if (captures) {
    const innerText = captures[1];
    return `<strong>${innerText}</strong>`;
  }
  return markdown;
};

const linkMarkdown2HtmlString = (markdown: string): string => {
  const linkMarkdownCaptureRegex = /^\[([^[]+)\]\(([^[]+)\)$/;

  const captures = linkMarkdownCaptureRegex.exec(markdown);
  if (captures) {
    const text = captures[1];
    const url = captures[2];

    return `<a href=${url}>${text}</a>`;
  }
  return markdown;
};

const markdown2Json = (markdown: string): HtmlAsJsonElement => {
  const markdownLinkRegex = /\[[^[]+\]\([^[]+\)/gm;
  const markdownStrongRegex = /\*{2}[^*]+\*{2}/gm;

  if (markdown.length > 10000) {
    throw Error(
      'Tekstblokken er for stor til å generere markdown. Prøv å dele opp den opprinnelige teksten i flere avsnitt.',
    );
  }

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
      case 'STRONG':
      case 'B':
        const boldText = Array.from(element.childNodes, htmlNode2Markdown).join('');
        return boldText ? `**${boldText}**` : '';
      case 'A':
        const linkText = Array.from(element.childNodes, htmlNode2Markdown).join('');
        const url = element.getAttribute('href');
        return linkText || url ? `[${linkText}](${url})` : '';
      default:
        if (isAcceptedTag(element.tagName)) {
          const textContent = Array.from(element.childNodes, htmlNode2Markdown).join('');
          return `<${element.tagName.toLowerCase()}>${textContent}</${element.tagName.toLowerCase()}>`;
        }
        return json2HtmlString(fromNode(element));
    }
  }
  return '';
};

export { htmlNode2Markdown, markdown2Json };
