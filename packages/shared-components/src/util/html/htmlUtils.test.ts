import { expect } from 'vitest';
import htmlUtils from './htmlUtils';

describe('htmlUtils', () => {
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

  describe('extractTextContent', () => {
    it('extracts text content from html string', () => {
      expect(htmlUtils.extractTextContent('<p>hello</p>')).toBe('hello');
      expect(htmlUtils.extractTextContent('<p>hello <b>world</b></p>')).toBe('hello world');
      expect(htmlUtils.extractTextContent('<p>hello <b>world</b> <a href="www.url.no">link</a></p>')).toBe(
        'hello world link',
      );
      expect(
        htmlUtils.extractTextContent(
          '<div><h3>Hello </h3><ol><li>List item 1</li><li><a href="www.url.no" target="_blank" rel="noopener noreferrer">link</a></li></ol></div>',
        ),
      ).toBe('Hello List item 1link');
    });
  });

  describe('removeEmptyTags', () => {
    it('removes empty tags', () => {
      expect(htmlUtils.removeEmptyTags('<p></p>')).toBe('');
      expect(htmlUtils.removeEmptyTags('<p>hello</p>')).toBe('<p>hello</p>');
      expect(htmlUtils.removeEmptyTags('<p>hello <b></b></p>')).toBe('<p>hello </p>');
      expect(htmlUtils.removeEmptyTags('<p>hello <b>world</b></p>')).toBe('<p>hello <b>world</b></p>');
      expect(htmlUtils.removeEmptyTags('<p>hello <b>world</b> <a href="www.url.no">link</a></p>')).toBe(
        '<p>hello <b>world</b> <a href="www.url.no">link</a></p>',
      );
      expect(
        htmlUtils.removeEmptyTags(
          '<div><h3>Hello </h3><ol><li>List item 1</li><li><a href="www.url.no" target="_blank" rel="noopener noreferrer">link</a></li></ol></div>',
        ),
      ).toBe(
        '<div><h3>Hello </h3><ol><li>List item 1</li><li><a href="www.url.no" target="_blank" rel="noopener noreferrer">link</a></li></ol></div>',
      );
    });

    it('does not remove self-closing tags br or hr', () => {
      expect(htmlUtils.removeEmptyTags('<p>hei<br></p>')).toBe('<p>hei<br></p>');
      expect(htmlUtils.removeEmptyTags('<p>hello <br><b></b></p>')).toBe('<p>hello <br></p>');
      expect(htmlUtils.removeEmptyTags('<div>hei<hr></div>')).toBe('<div>hei<hr></div>');
      expect(htmlUtils.removeEmptyTags('<div>hello <hr><b></b></div>')).toBe('<div>hello <hr></div>');
    });

    it('does remove self-closing tags if they are children of an otherwise empty tag', () => {
      expect(htmlUtils.removeEmptyTags('<p><br></p>')).toBe('');
      expect(htmlUtils.removeEmptyTags('<div><hr></div>')).toBe('');
    });
  });

  describe('sanitizeHtmlString', () => {
    it('removes script and styles tags', () => {
      expect(htmlUtils.sanitizeHtmlString('<script></script><p>hello</p>')).toBe('<p>hello</p>');
      expect(htmlUtils.sanitizeHtmlString('<style>h1 {color:red; }p {color:blue;}</style><p>hello</p>')).toBe(
        '<p>hello</p>',
      );
    });

    it('allows target attribute on links and keeps the order of the attributes', () => {
      expect(
        htmlUtils.sanitizeHtmlString('<a href="www.url.no" target="_blank" rel="noopener noreferrer">hello</a>'),
      ).toBe('<a href="www.url.no" target="_blank" rel="noopener noreferrer">hello</a>');
    });

    it('removes forbidden attributes', () => {
      const options = { FORBID_ATTR: ['style', 'class'] };
      expect(htmlUtils.sanitizeHtmlString('<div style="color: deeppink">hello</div>', options)).toBe(
        '<div>hello</div>',
      );
      expect(htmlUtils.sanitizeHtmlString('<div class="wrapper">hello</div>', options)).toBe('<div>hello</div>');
    });
  });

  describe('removeTags', () => {
    it('removes all tags of a given type and keeps the content', () => {
      expect(htmlUtils.removeTags('<p>hello</p>', 'p')).toBe('hello');
      expect(htmlUtils.removeTags('<p>hello</p><p>world</p>', 'p')).toBe('helloworld');
      expect(htmlUtils.removeTags('<p>hello</p><p>world</p><p>!</p>', 'p')).toBe('helloworld!');
      expect(htmlUtils.removeTags('<p>hello</p><p>world</p><p>!</p><p>?</p>', 'p')).toBe('helloworld!?');
    });

    it('removes tags of a given type and keeps other tags', () => {
      expect(htmlUtils.removeTags('<p>hello <b>world</b></p>', 'b')).toBe('<p>hello world</p>');
      expect(htmlUtils.removeTags('<p>hello <b>world</b> <a href="www.url.no">link</a></p>', 'b')).toBe(
        '<p>hello world <a href="www.url.no">link</a></p>',
      );
    });

    it('removes all tags of a given type while keeping children of other tags', () => {
      expect(htmlUtils.removeTags('<p><span>hello <b>world</b></span></p>', 'span')).toBe('<p>hello <b>world</b></p>');
      expect(htmlUtils.removeTags('<div><p>hello <b>world</b></p><div><p>foo</p></div><p>bar</p></div>', 'div')).toBe(
        '<p>hello <b>world</b></p><p>foo</p><p>bar</p>',
      );
    });
  });
});
