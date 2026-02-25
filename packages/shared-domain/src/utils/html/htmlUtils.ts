import DOMPurify from 'dompurify';
import type { DOMPurifyConfig } from '../../models/html';

let domPurifyInstance: any = null;

const getDOMPurify = (): any => {
  if (domPurifyInstance) return domPurifyInstance;
  if (typeof window !== 'undefined') {
    domPurifyInstance = (window as any).DOMPurify || DOMPurify;
    return domPurifyInstance;
  } else {
    // Node.js. Allow require to avoid loading jsdom in browser environments.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM('');
    domPurifyInstance = DOMPurify(window);
    return domPurifyInstance;
  }
};

const sanitize = (htmlString: string | Node, options?: DOMPurifyConfig): string => {
  const purify = getDOMPurify();
  return purify.sanitize(htmlString, options).toString();
};

const isHtmlString = (text: string) => /<(?!br\s*\/?)[^>]+>/gm.test(text);

export const htmlUtils = {
  sanitize,
  isHtmlString,
};
