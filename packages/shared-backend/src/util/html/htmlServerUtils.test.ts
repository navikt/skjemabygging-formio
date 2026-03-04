import { expect } from 'vitest';
import { htmlServerUtils } from './htmlServerUtils';

describe('htmlServerUtils', () => {
  describe('sanitizeHtmlString', () => {
    it('removes script and styles tags', () => {
      expect(htmlServerUtils.sanitize('<script></script><p>hello</p>')).toBe('<p>hello</p>');
      expect(htmlServerUtils.sanitize('<style>h1 {color:red; }p {color:blue;}</style><p>hello</p>')).toBe(
        '<p>hello</p>',
      );
    });

    it('allows target attribute on links and keeps the order of the attributes', () => {
      expect(htmlServerUtils.sanitize('<a href="www.url.no" target="_blank" rel="noopener noreferrer">hello</a>')).toBe(
        '<a href="www.url.no" rel="noopener noreferrer">hello</a>',
      );
    });

    it('removes forbidden attributes', () => {
      const options = { FORBID_ATTR: ['style', 'class'] };
      expect(htmlServerUtils.sanitize('<div style="color: deeppink">hello</div>', options)).toBe('<div>hello</div>');
      expect(htmlServerUtils.sanitize('<div class="wrapper">hello</div>', options)).toBe('<div>hello</div>');
    });
  });
});
