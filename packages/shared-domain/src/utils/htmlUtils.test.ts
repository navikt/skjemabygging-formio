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
});
