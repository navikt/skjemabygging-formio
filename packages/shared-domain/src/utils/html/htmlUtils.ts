import DOMPurify from 'isomorphic-dompurify';
import { DOMPurifyConfig } from '../../models';

const sanitize = (htmlString: string | Node, options?: DOMPurifyConfig): string => {
  return DOMPurify.sanitize(htmlString, options).toString();
};

const isHtmlString = (text: string) => /<(?!br\s*\/?)[^>]+>/gm.test(text);

export const htmlUtils = {
  sanitize,
  isHtmlString,
};
