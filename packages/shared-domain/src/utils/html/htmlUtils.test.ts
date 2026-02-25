import { htmlUtils } from './htmlUtils';

describe('htmlTranslationUtils', () => {
  describe('isHtmlString', () => {
    it('returns true if string contains an opening tag', () => {
      expect(htmlUtils.isHtmlString('bla bla <a>hello')).toBe(true);
      expect(htmlUtils.isHtmlString('bla bla <a href="www.url.no">hello')).toBe(true);
      expect(
        htmlUtils.isHtmlString('bla bla <a href="www.url.no" target="_blank" rel="noopener noreferrer">hello'),
      ).toBe(true);
    });

    it('returns false if the only tag is a <br>', () => {
      expect(htmlUtils.isHtmlString('bla bla <br>hello')).toBe(false);
    });

    it('returns true if it contains an allowed tag in addition to a <br>', () => {
      expect(htmlUtils.isHtmlString('bla <a> bla <br>hello')).toBe(true);
    });

    it('does not match when string contains a < with no closing >', () => {
      expect(htmlUtils.isHtmlString('bla bla <a hello')).toBe(false);
    });
  });

  describe('sanitizeHtmlString', () => {
    it('removes script and styles tags', () => {
      expect(htmlUtils.sanitize('<script></script><p>hello</p>')).toBe('<p>hello</p>');
      expect(htmlUtils.sanitize('<style>h1 {color:red; }p {color:blue;}</style><p>hello</p>')).toBe('<p>hello</p>');
    });

    it('allows target attribute on links and keeps the order of the attributes', () => {
      expect(htmlUtils.sanitize('<a href="www.url.no" target="_blank" rel="noopener noreferrer">hello</a>')).toBe(
        '<a href="www.url.no" rel="noopener noreferrer">hello</a>',
      );
    });

    it('removes forbidden attributes', () => {
      const options = { FORBID_ATTR: ['style', 'class'] };
      expect(htmlUtils.sanitize('<div style="color: deeppink">hello</div>', options)).toBe('<div>hello</div>');
      expect(htmlUtils.sanitize('<div class="wrapper">hello</div>', options)).toBe('<div>hello</div>');
    });
  });
});
