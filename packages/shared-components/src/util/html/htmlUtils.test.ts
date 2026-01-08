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

    it('removes multiple tags', () => {
      expect(htmlUtils.removeTags('<p>hello <b>world</b></p>', ['p', 'b'])).toBe('hello world');
      expect(htmlUtils.removeTags('<p>hello <b>world</b> <a href="www.url.no">link</a></p>', ['p', 'b'])).toBe(
        'hello world <a href="www.url.no">link</a>',
      );
      expect(htmlUtils.removeTags('<div><p>hello</p><span>world</span></div>', ['div', 'span'])).toBe(
        '<p>hello</p>world',
      );
    });
  });

  describe('getTexts', () => {
    it('returns text content of tags', () => {
      expect(htmlUtils.getTexts('<p>hello world</p>')).toEqual(['hello world']);
      expect(htmlUtils.getTexts('<p>hello</p><p>world</p>')).toEqual(['hello', 'world']);
      expect(htmlUtils.getTexts('<p>List:</p><ol><li>Item 1</li><li>Item 2</li></ol>')).toEqual([
        'List:',
        'Item 1',
        'Item 2',
      ]);
      expect(htmlUtils.getTexts('<ol><li>"Første punkt "<b>har fet skrift</b>" og normal skrift"</li></ol>')).toEqual([
        '"Første punkt "**har fet skrift**" og normal skrift"',
      ]);
    });

    it('transforms b- and a-tags to markdown', () => {
      expect(htmlUtils.getTexts('<p>hello <b>world</b> <a href="www.url.no">link</a></p>')).toEqual([
        'hello **world** [link](www.url.no)',
      ]);
      expect(htmlUtils.getTexts('<p>hello <span><b>world</b> <a href="www.url.no">link</a></span></p>')).toEqual([
        'hello **world** [link](www.url.no)',
      ]);
      expect(
        htmlUtils.getTexts(
          '<div><p>List:</p><ol><li>Item <b>with bold</b> and normal text</li><li>Item <a href="www.url.no">with link</a></li></ol></div>',
        ),
      ).toEqual(['List:', 'Item **with bold** and normal text', 'Item [with link](www.url.no)']);
    });
  });

  describe('wrapTopLevelTextNodesInP', () => {
    it('wraps lonely text nodes in <p> tags', () => {
      expect(htmlUtils.groupLonelyChildren('<h3>Overskrift</h3>Lonely child')).toBe(
        '<h3>Overskrift</h3><p>Lonely child</p>',
      );
      expect(htmlUtils.groupLonelyChildren('Lonely child<p>Hello world</p>')).toBe(
        '<p>Lonely child</p><p>Hello world</p>',
      );
      expect(htmlUtils.groupLonelyChildren('<h3>Overskrift</h3>Lonely child<p>Hello world</p>')).toBe(
        '<h3>Overskrift</h3><p>Lonely child</p><p>Hello world</p>',
      );
    });

    it('also wraps <a>, <b>, and <strong> elements in <p> tags', () => {
      expect(htmlUtils.groupLonelyChildren('<h3>Overskrift</h3><a href="www.url.no">link</a>')).toBe(
        '<h3>Overskrift</h3><p><a href="www.url.no">link</a></p>',
      );
      expect(htmlUtils.groupLonelyChildren('Some text <b>bold text</b><strong>strong text</strong>')).toBe(
        '<p>Some text <b>bold text</b><strong>strong text</strong></p>',
      );
      expect(
        htmlUtils.groupLonelyChildren('<h3>Overskrift</h3>Some text <a href="www.url.no">link</a><b>bold</b>'),
      ).toBe('<h3>Overskrift</h3><p>Some text <a href="www.url.no">link</a><b>bold</b></p>');
    });

    it('does not wrap other elements', () => {
      expect(htmlUtils.groupLonelyChildren('<h3>Overskrift</h3>Hello <p>content</p> World')).toBe(
        '<h3>Overskrift</h3><p>Hello </p><p>content</p><p> World</p>',
      );
      expect(htmlUtils.groupLonelyChildren('Some content<ol><li>Pt. 1</li><li>Pt. 2</li></ol>More content')).toBe(
        '<p>Some content</p><ol><li>Pt. 1</li><li>Pt. 2</li></ol><p>More content</p>',
      );
    });

    it('does not wrap only <br> tags', () => {
      expect(htmlUtils.groupLonelyChildren('<h3>Overskrift</h3><br><br>')).toBe('<h3>Overskrift</h3><br><br>');
      expect(htmlUtils.groupLonelyChildren('<br><br>Some text<br>')).toBe('<p><br><br>Some text<br></p>');
    });
  });
});
