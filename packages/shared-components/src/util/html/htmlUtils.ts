import DOMPurify from 'dompurify';
import { defaultLeafTags, generateMarkdown } from './markdown';

type SanitizeOptions = Omit<DOMPurify.Config, 'RETURN_DOM_FRAGMENT' | 'RETURN_DOM'>;

const topLevelTags = ['H2', 'H3', 'P', 'OL', 'UL'];
const textFormattingTags = ['A', 'B', 'STRONG', 'BR'];

/**
 * Regex matches that there is an html-tag in the string,
 * excluding the <br>-tag (with possible whitespace and self-closing "/").
 */
const isHtmlString = (text: string) => /<(?!br\s*\/?)[^>]+>/gm.test(text);

const getHtmlTag = (htmlString: string): string | null => {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstElementChild?.tagName || null;
};

/**
 * Checks if all childNodes of the given HTMLElement are elements and their tagName is in topLevelTags.
 */
const areAllChildrenTopLevelTags = (element: HTMLElement): boolean => {
  return Array.from(element.childNodes).every(
    (node) => node.nodeType === Node.ELEMENT_NODE && topLevelTags.includes((node as HTMLElement).tagName),
  );
};

const extractTextContent = (htmlString: string) => {
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  return div.textContent ?? div.innerText;
};

const removeEmptyTags = (htmlString: string): string => {
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  const selfClosingTags = ['BR', 'HR'];
  div.querySelectorAll('*').forEach((element) => {
    if (!selfClosingTags.includes(element.tagName) && element.textContent?.trim() === '') {
      element.remove();
    }
  });
  return div.innerHTML;
};

const sanitizeHtmlString = (htmlString: string, options?: SanitizeOptions): string => {
  const defaultOptions: SanitizeOptions = { ADD_ATTR: ['target'] };
  const sanitizeOptions = { ...defaultOptions, ...options };
  return DOMPurify.sanitize(DOMPurify.sanitize(htmlString, sanitizeOptions), sanitizeOptions);
};

const removeTags = (htmlString: string, tag: string | string[]): string => {
  const tagSelector = typeof tag === 'string' ? tag : tag.join(',');
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  div.querySelectorAll(tagSelector).forEach((element) => {
    while (element.firstChild) {
      element.parentNode?.insertBefore(element.firstChild, element);
    }
    element.remove();
  });
  return div.innerHTML;
};

const getTexts = (htmlString: string): string[] => {
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  if (areAllChildrenTopLevelTags(div)) {
    return Array.from(div.querySelectorAll(defaultLeafTags.join(',').toLowerCase())).map((element) => {
      return Array.from(element.childNodes, generateMarkdown).join('');
    });
  }
  return [Array.from(div.childNodes, generateMarkdown).join('')];
};

/**
 * Groups consecutive child text nodes, <a>, <b>, and <strong> elements into a single <p> tag.
 */
const groupLonelySiblings = (htmlString: string): string => {
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  const fragment = document.createDocumentFragment();

  let buffer: ChildNode[] = [];
  const flushBuffer = () => {
    if (buffer.length > 0) {
      if (buffer.every((node) => node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'BR')) {
        buffer.forEach((node) => fragment.appendChild(node));
      } else {
        const p = document.createElement('p');
        buffer.forEach((node) => p.appendChild(node));
        fragment.appendChild(p);
      }
      buffer = [];
    }
  };

  const childNodes = Array.from(div.childNodes);
  // if no headings, paragraphs or lists, return original htmlString
  if (
    !childNodes.some(
      (node) => node.nodeType === Node.ELEMENT_NODE && topLevelTags.includes((node as HTMLElement).tagName),
    )
  ) {
    return div.innerHTML;
  }

  childNodes.forEach((node) => {
    if (
      (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim() !== '') ||
      (node.nodeType === Node.ELEMENT_NODE && textFormattingTags.includes((node as HTMLElement).tagName))
    ) {
      buffer.push(node);
    } else {
      flushBuffer();
      fragment.appendChild(node);
    }
  });
  flushBuffer();
  div.innerHTML = '';
  div.appendChild(fragment);
  return div.innerHTML;
};

const htmlUtils = {
  isHtmlString,
  getHtmlTag,
  extractTextContent,
  removeEmptyTags,
  sanitizeHtmlString,
  removeTags,
  getTexts,
  groupLonelySiblings,
};
export default htmlUtils;
