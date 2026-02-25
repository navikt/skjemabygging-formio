import createDOMPurify, { Config as DOMPurifyConfig } from 'dompurify';
import { JSDOM } from 'jsdom';

let domPurifyInstance: any = null;

/**
 * This function initializes and returns a singleton instance of DOMPurify using JSDOM to create a virtual window object for use in NodeJS
 */
const getDOMPurify = (): any => {
  if (domPurifyInstance) return domPurifyInstance;
  const { window } = new JSDOM('');
  domPurifyInstance = createDOMPurify(window);
  return domPurifyInstance;
};

const sanitize = (htmlString: string, options?: DOMPurifyConfig): string => {
  const purify = getDOMPurify();
  return purify.sanitize(htmlString, options);
};

const htmlServerUtils = {
  sanitize,
};

export { htmlServerUtils };
