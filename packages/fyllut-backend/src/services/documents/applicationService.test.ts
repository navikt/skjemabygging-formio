import { sanitizeLabel, sanitizeValue } from './applicationService';

describe('Sanitize values before sending to PDF generation', () => {
  describe('sanitizeLabel', () => {
    it('removes script and unwanted tags, allows only allowed tags and attributes', () => {
      expect(
        sanitizeLabel(
          '<script>alert(1)</script><h2>Header</h2><b>bold</b><a href="https://www.nav.no" target="_blank">link</a>',
        ),
      ).toBe('<h2>Header</h2><b>bold</b><a href="https://www.nav.no">link</a>');
      expect(sanitizeLabel('<img src="x" /><div>text</div>')).toBe('<div>text</div>');
      expect(sanitizeLabel('<a href="https://evil.com" onclick="alert(1)">bad</a>')).toBe(
        '<a href="https://evil.com">bad</a>',
      );
      expect(sanitizeLabel('<a href="https://www.nav.no" onclick="alert(1)">good</a>')).toBe(
        '<a href="https://www.nav.no">good</a>',
      );
      expect(sanitizeLabel('<a href="https://www.nav.no" class="foo" target="_blank">good</a>')).toBe(
        '<a href="https://www.nav.no">good</a>',
      );
      expect(sanitizeLabel('<a href="https://example.com">bad</a>')).toBe('<a href="https://example.com">bad</a>');
      expect(sanitizeLabel('<a>no href</a>')).toBe('<a>no href</a>');
      expect(sanitizeLabel('<p>hello</p>')).toBe('<p>hello</p>');
      expect(sanitizeLabel('plain text')).toBe('plain text');
    });

    it('returns undefined for undefined or empty input', () => {
      expect(sanitizeLabel(undefined)).toBeUndefined();
      expect(sanitizeLabel('')).toBeUndefined();
    });
  });

  describe('sanitizeValue', () => {
    it('removes all HTML tags except text', () => {
      expect(sanitizeValue('<script>alert(1)</script>hello')).toBe('hello');
      expect(sanitizeValue('<script>alert(1) hello')).toBe('');
      expect(sanitizeValue('<b>bold</b> <i>italic</i>')).toBe('bold italic');
      expect(sanitizeValue('<a href="https://www.nav.no">link</a>')).toBe('link');
      expect(sanitizeValue('<img src="x">foo')).toBe('foo');
      expect(sanitizeValue('<div>bar</div>baz')).toBe('barbaz');
    });

    it('returns undefined for non-string or empty input', () => {
      expect(sanitizeValue(undefined)).toBeUndefined();
      expect(sanitizeValue(null)).toBeUndefined();
      expect(sanitizeValue(123)).toBeUndefined();
      expect(sanitizeValue('')).toBe('');
    });
  });
});
