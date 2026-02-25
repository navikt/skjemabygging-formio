import { expect } from 'vitest';
import htmlTranslationUtils from './htmlTranslationUtils';

describe('htmlTranslationUtils', () => {
  describe('getHtmlTag', () => {
    it('returns the tag name of the first html element in the string', () => {
      expect(htmlTranslationUtils.getHtmlTag('<p>hello</p>')).toBe('P');
      expect(htmlTranslationUtils.getHtmlTag('   <div>hello</div>')).toBe('DIV');
      expect(htmlTranslationUtils.getHtmlTag('<span>hello</span><p>world</p>')).toBe('SPAN');
      expect(htmlTranslationUtils.getHtmlTag('hello<h3>world</h3>')).toBe('H3');
    });
  });

  describe('extractTextContent', () => {
    it('extracts text content from html string', () => {
      expect(htmlTranslationUtils.extractTextContent('<p>hello</p>')).toBe('hello');
      expect(htmlTranslationUtils.extractTextContent('<p>hello <b>world</b></p>')).toBe('hello world');
      expect(htmlTranslationUtils.extractTextContent('<p>hello <b>world</b> <a href="www.url.no">link</a></p>')).toBe(
        'hello world link',
      );
      expect(
        htmlTranslationUtils.extractTextContent(
          '<div><h3>Hello </h3><ol><li>List item 1</li><li><a href="www.url.no" target="_blank" rel="noopener noreferrer">link</a></li></ol></div>',
        ),
      ).toBe('Hello List item 1link');
    });
  });

  describe('removeEmptyTags', () => {
    it('removes empty tags', () => {
      expect(htmlTranslationUtils.removeEmptyTags('<p></p>')).toBe('');
      expect(htmlTranslationUtils.removeEmptyTags('<p>hello</p>')).toBe('<p>hello</p>');
      expect(htmlTranslationUtils.removeEmptyTags('<p>hello <b></b></p>')).toBe('<p>hello </p>');
      expect(htmlTranslationUtils.removeEmptyTags('<p>hello <b>world</b></p>')).toBe('<p>hello <b>world</b></p>');
      expect(htmlTranslationUtils.removeEmptyTags('<p>hello <b>world</b> <a href="www.url.no">link</a></p>')).toBe(
        '<p>hello <b>world</b> <a href="www.url.no">link</a></p>',
      );
      expect(
        htmlTranslationUtils.removeEmptyTags(
          '<div><h3>Hello </h3><ol><li>List item 1</li><li><a href="www.url.no" target="_blank" rel="noopener noreferrer">link</a></li></ol></div>',
        ),
      ).toBe(
        '<div><h3>Hello </h3><ol><li>List item 1</li><li><a href="www.url.no" target="_blank" rel="noopener noreferrer">link</a></li></ol></div>',
      );
    });

    it('does not remove self-closing tags br or hr', () => {
      expect(htmlTranslationUtils.removeEmptyTags('<p>hei<br></p>')).toBe('<p>hei<br></p>');
      expect(htmlTranslationUtils.removeEmptyTags('<p>hello <br><b></b></p>')).toBe('<p>hello <br></p>');
      expect(htmlTranslationUtils.removeEmptyTags('<div>hei<hr></div>')).toBe('<div>hei<hr></div>');
      expect(htmlTranslationUtils.removeEmptyTags('<div>hello <hr><b></b></div>')).toBe('<div>hello <hr></div>');
    });

    it('does remove self-closing tags if they are children of an otherwise empty tag', () => {
      expect(htmlTranslationUtils.removeEmptyTags('<p><br></p>')).toBe('');
      expect(htmlTranslationUtils.removeEmptyTags('<div><hr></div>')).toBe('');
    });

    it('removes tags if text content is only whitespace', () => {
      expect(htmlTranslationUtils.removeEmptyTags('<p>   </p>')).toBe('');
      expect(htmlTranslationUtils.removeEmptyTags('<div>\n\t</div>')).toBe('');
      expect(htmlTranslationUtils.removeEmptyTags('<p>hello <b>   </b></p>')).toBe('<p>hello </p>');
    });

    it('removes top level text nodes that are only whitespace', () => {
      expect(htmlTranslationUtils.removeEmptyTags('<p>hello</p>   <p>world</p>')).toBe('<p>hello</p><p>world</p>');
      expect(htmlTranslationUtils.removeEmptyTags('\n\t<div>hello</div>\n')).toBe('<div>hello</div>');
    });
  });

  describe('sanitizeHtmlString', () => {
    it('allows target attribute on links and keeps the order of the attributes', () => {
      expect(
        htmlTranslationUtils.sanitizeHtmlString(
          '<a href="www.url.no" target="_blank" rel="noopener noreferrer">hello</a>',
        ),
      ).toBe('<a href="www.url.no" target="_blank" rel="noopener noreferrer">hello</a>');
    });
  });

  describe('removeTags', () => {
    it('removes all tags of a given type and keeps the content', () => {
      expect(htmlTranslationUtils.removeTags('<p>hello</p>', 'p')).toBe('hello');
      expect(htmlTranslationUtils.removeTags('<p>hello</p><p>world</p>', 'p')).toBe('helloworld');
      expect(htmlTranslationUtils.removeTags('<p>hello</p><p>world</p><p>!</p>', 'p')).toBe('helloworld!');
      expect(htmlTranslationUtils.removeTags('<p>hello</p><p>world</p><p>!</p><p>?</p>', 'p')).toBe('helloworld!?');
    });

    it('removes tags of a given type and keeps other tags', () => {
      expect(htmlTranslationUtils.removeTags('<p>hello <b>world</b></p>', 'b')).toBe('<p>hello world</p>');
      expect(htmlTranslationUtils.removeTags('<p>hello <b>world</b> <a href="www.url.no">link</a></p>', 'b')).toBe(
        '<p>hello world <a href="www.url.no">link</a></p>',
      );
    });

    it('removes all tags of a given type while keeping children of other tags', () => {
      expect(htmlTranslationUtils.removeTags('<p><span>hello <b>world</b></span></p>', 'span')).toBe(
        '<p>hello <b>world</b></p>',
      );
      expect(
        htmlTranslationUtils.removeTags('<div><p>hello <b>world</b></p><div><p>foo</p></div><p>bar</p></div>', 'div'),
      ).toBe('<p>hello <b>world</b></p><p>foo</p><p>bar</p>');
    });

    it('removes multiple tags', () => {
      expect(htmlTranslationUtils.removeTags('<p>hello <b>world</b></p>', ['p', 'b'])).toBe('hello world');
      expect(
        htmlTranslationUtils.removeTags('<p>hello <b>world</b> <a href="www.url.no">link</a></p>', ['p', 'b']),
      ).toBe('hello world <a href="www.url.no">link</a>');
      expect(htmlTranslationUtils.removeTags('<div><p>hello</p><span>world</span></div>', ['div', 'span'])).toBe(
        '<p>hello</p>world',
      );
    });
  });

  describe('getTexts', () => {
    it('returns text content of tags', () => {
      expect(htmlTranslationUtils.getTexts('<p>hello world</p>')).toEqual(['hello world']);
      expect(htmlTranslationUtils.getTexts('<p>hello</p><p>world</p>')).toEqual(['hello', 'world']);
      expect(htmlTranslationUtils.getTexts('<p>List:</p><ol><li>Item 1</li><li>Item 2</li></ol>')).toEqual([
        'List:',
        'Item 1',
        'Item 2',
      ]);
      expect(
        htmlTranslationUtils.getTexts('<ol><li>"Første punkt "<b>har fet skrift</b>" og normal skrift"</li></ol>'),
      ).toEqual(['"Første punkt "**har fet skrift**" og normal skrift"']);
      expect(htmlTranslationUtils.getTexts('<div><b>Fet tekst</b></div><p>Avsnitt</p>')).toEqual([
        '**Fet tekst**',
        'Avsnitt',
      ]);
    });

    it('transforms b- and a-tags to markdown', () => {
      expect(htmlTranslationUtils.getTexts('hello <b>world</b>')).toEqual(['hello **world**']);
      expect(
        htmlTranslationUtils.getTexts(`This is a <a href="www.url.no">link</a> and this is <b>bold</b> text.`),
      ).toEqual(['This is a [link](www.url.no) and this is **bold** text.']);
      expect(htmlTranslationUtils.getTexts('<p>hello <b>world</b> <a href="www.url.no">link</a></p>')).toEqual([
        'hello **world** [link](www.url.no)',
      ]);
      expect(
        htmlTranslationUtils.getTexts('<p>hello <span><b>world</b> <a href="www.url.no">link</a></span></p>'),
      ).toEqual(['hello **world** [link](www.url.no)']);
      expect(
        htmlTranslationUtils.getTexts(
          '<p>List:</p><ol><li>Item <b>with bold</b> and normal text</li><li>Item <a href="www.url.no">with link</a></li></ol>',
        ),
      ).toEqual(['List:', 'Item **with bold** and normal text', 'Item [with link](www.url.no)']);
    });

    it('returns empty array for empty string', () => {
      expect(htmlTranslationUtils.getTexts('')).toEqual([]);
    });

    it('does not remove parts of html string that can´t be processed', () => {
      expect(htmlTranslationUtils.getTexts('<div>Hello <custom-tag>world</custom-tag></div>')).toEqual([
        'Hello <custom-tag>world</custom-tag>',
      ]);
    });

    it('does not support a mix of top level tags and text formatting tags on the same level', () => {
      expect(htmlTranslationUtils.getTexts('Hello <p>world</p>')).toEqual(['Hello <p>world</p>']);
      expect(htmlTranslationUtils.getTexts('<p>Hello </p><b>world</b><h3>Heading</h3>')).toEqual([
        '<p>Hello </p>**world**<h3>Heading</h3>',
      ]);
    });
  });

  describe('groupLonelySiblings', () => {
    it('wraps lonely text nodes in <p> tags', () => {
      expect(htmlTranslationUtils.groupLonelySiblings('<h3>Overskrift</h3>Lonely child')).toBe(
        '<h3>Overskrift</h3><p>Lonely child</p>',
      );
      expect(htmlTranslationUtils.groupLonelySiblings('Lonely child<p>Hello world</p>')).toBe(
        '<p>Lonely child</p><p>Hello world</p>',
      );
      expect(htmlTranslationUtils.groupLonelySiblings('<h3>Overskrift</h3>Lonely child<p>Hello world</p>')).toBe(
        '<h3>Overskrift</h3><p>Lonely child</p><p>Hello world</p>',
      );
      expect(htmlTranslationUtils.groupLonelySiblings('<ol><li>item 1</li></ol>Lonely child')).toBe(
        '<ol><li>item 1</li></ol><p>Lonely child</p>',
      );
      expect(htmlTranslationUtils.groupLonelySiblings('Lonely child<ul><li>item 1</li></ul>')).toBe(
        '<p>Lonely child</p><ul><li>item 1</li></ul>',
      );
    });

    it('also wraps <a>, <b>, and <strong> elements in <p> tags', () => {
      expect(htmlTranslationUtils.groupLonelySiblings('<h3>Overskrift</h3><a href="www.url.no">link</a>')).toBe(
        '<h3>Overskrift</h3><p><a href="www.url.no">link</a></p>',
      );
      expect(
        htmlTranslationUtils.groupLonelySiblings(
          '<h3>Overskrift</h3>Some text <a href="www.url.no">link</a><b>bold</b>',
        ),
      ).toBe('<h3>Overskrift</h3><p>Some text <a href="www.url.no">link</a><b>bold</b></p>');
    });

    it('does not wrap other elements', () => {
      expect(htmlTranslationUtils.groupLonelySiblings('<h3>Overskrift</h3>Hello <p>content</p> World')).toBe(
        '<h3>Overskrift</h3><p>Hello </p><p>content</p><p> World</p>',
      );
      expect(
        htmlTranslationUtils.groupLonelySiblings('Some content<ol><li>Pt. 1</li><li>Pt. 2</li></ol>More content'),
      ).toBe('<p>Some content</p><ol><li>Pt. 1</li><li>Pt. 2</li></ol><p>More content</p>');
    });

    it('does not wrap only <br> tags', () => {
      expect(htmlTranslationUtils.groupLonelySiblings('<h3>Overskrift</h3><br><br>')).toBe(
        '<h3>Overskrift</h3><br><br>',
      );
      expect(htmlTranslationUtils.groupLonelySiblings('<h3>Overskrift</h3><br><br>Some text<br>')).toBe(
        '<h3>Overskrift</h3><p><br><br>Some text<br></p>',
      );
    });

    it('does not wrap text nodes if there are no siblings that is either heading, paragraph or list', () => {
      expect(htmlTranslationUtils.groupLonelySiblings('Lonely child')).toBe('Lonely child');
      expect(htmlTranslationUtils.groupLonelySiblings('Some text <b>bold text</b><strong>strong text</strong>')).toBe(
        'Some text <b>bold text</b><strong>strong text</strong>',
      );
      expect(htmlTranslationUtils.groupLonelySiblings('<br><br>Some text<br>')).toBe('<br><br>Some text<br>');
    });
  });
});
