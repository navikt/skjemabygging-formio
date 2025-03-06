import DOMPurify from 'dompurify';

type SanitizeOptions = Omit<DOMPurify.Config, 'RETURN_DOM_FRAGMENT' | 'RETURN_DOM'>;

/**
 * Regex matches that there is an html-tag in the string,
 * excluding the <br>-tag (with possible whitespace and self-closing "/").
 */
const isHtmlString = (text: string) => /<(?!br\s*\/?)[^>]+>/gm.test(text);

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

// const removeTags = (htmlString: string, tag: string): string => {
//   const div = document.createElement('div');
//   div.innerHTML = htmlString;
//   div.querySelectorAll(tag).forEach((element) => {
//     while (element.firstChild) {
//       element.parentNode?.insertBefore(element.firstChild, element);
//     }
//     element.remove();
//   });
//   return div.innerHTML;
// };

const htmlUtils = { isHtmlString, extractTextContent, removeEmptyTags, sanitizeHtmlString };
export default htmlUtils;
