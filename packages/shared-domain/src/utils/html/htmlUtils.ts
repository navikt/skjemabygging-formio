import DOMPurify from 'isomorphic-dompurify';
import type { DOMPurifyConfig } from '../../models/html';

const sanitize = (htmlString: string | Node, options?: DOMPurifyConfig): string => {
  return DOMPurify.sanitize(htmlString, options).toString();
};

const isHtmlString = (text: string) => /<(?!br\s*\/?)[^>]+>/gm.test(text);

export const htmlUtils = {
  sanitize,
  isHtmlString,
};
