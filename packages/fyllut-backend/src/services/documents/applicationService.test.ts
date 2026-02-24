import { sanitizePdfFormData } from './applicationService';

describe('sanitizePdfFormData', () => {
  it('removes <script> tags', () => {
    expect(sanitizePdfFormData('<div>hello<script>alert(1)</script></div>')).toBe('<div>hello</div>');
    expect(sanitizePdfFormData('<script type="text/javascript">alert(1)</script>foo')).toBe('foo');
    expect(sanitizePdfFormData('<div><script src="x.js"></script>bar</div>')).toBe('<div>bar</div>');
    expect(sanitizePdfFormData('<div><script>alert(1)</div>')).toBe('<div>alert(1)</div>');
  });

  it('removes <img> tags', () => {
    expect(sanitizePdfFormData('<img src="x" /><div>text</div>')).toBe('<div>text</div>');
    expect(sanitizePdfFormData('<img width="100" height="100">')).toBe('');
    expect(sanitizePdfFormData('<img src="x" alt="y" /><span>ok</span>')).toBe('<span>ok</span>');
  });

  it('removes nested unwanted tags', () => {
    expect(sanitizePdfFormData('<div><script>alert(1)</script><img src="x"><a href="http://bad">bad</a></div>')).toBe(
      '<div>bad</div>',
    );
  });

  it('removes multiple unwanted tags in one go', () => {
    const input =
      '<img src="x"><script>bad()</script><a href="https://foo.com">bad</a><a href="https://www.nav.no">good</a>';
    const expected = 'bad<a href="https://www.nav.no">good</a>';
    expect(sanitizePdfFormData(input)).toBe(expected);
  });

  it('removes multiple unwanted tags in mixed content', () => {
    const input =
      '<img src="x"><script>bad()</script><a href="https://foo.com">bad</a><a href="https://www.nav.no">good</a><a>no href</a>';
    const expected = 'bad<a href="https://www.nav.no">good</a>no href';
    expect(sanitizePdfFormData(input)).toBe(expected);
  });

  it('removes <a> tags with non-nav.no href, keeps inner text', () => {
    expect(sanitizePdfFormData('<a href="https://example.com">bad</a>')).toBe('bad');
    expect(sanitizePdfFormData('<a href="http://foo.bar">bad</a>')).toBe('bad');
    expect(sanitizePdfFormData('<a href="http://evil.com">bad</a>')).toBe('bad');
    expect(sanitizePdfFormData('<a href="mailto:foo@bar.com">mail</a>')).toBe('mail');
    expect(sanitizePdfFormData('<a href="">empty</a>')).toBe('empty');
    expect(sanitizePdfFormData('<a href="https://example.com?redirect=https://www.nav.no">bad</a>')).toBe('bad');
    expect(sanitizePdfFormData('<a href="https://foo.bar/nav.no">bad</a>')).toBe('bad');
  });

  it('removes <a> tags with no href', () => {
    expect(sanitizePdfFormData('<a>no href</a>')).toBe('no href');
    expect(sanitizePdfFormData('<a name="anchor">anchor</a>')).toBe('anchor');
  });

  it('keeps <a> tags with nav.no in href', () => {
    expect(sanitizePdfFormData('<a href="https://www.nav.no/abc">good</a>')).toBe(
      '<a href="https://www.nav.no/abc">good</a>',
    );
    expect(sanitizePdfFormData('<a href="https://nav.no/xyz">good</a>')).toBe('<a href="https://nav.no/xyz">good</a>');
    expect(sanitizePdfFormData('<a href="https://subdomain.nav.no/path">good</a>')).toBe(
      '<a href="https://subdomain.nav.no/path">good</a>',
    );
    expect(sanitizePdfFormData('<a href="https://www.nav.no" class="foo" target="_blank">good</a>')).toBe(
      '<a href="https://www.nav.no" class="foo" target="_blank">good</a>',
    );
    expect(sanitizePdfFormData('<a class="foo" target="_blank" href="https://www.nav.no">good</a>')).toBe(
      '<a href="https://www.nav.no" class="foo" target="_blank">good</a>',
    );
  });

  it('preserves unrelated HTML and text', () => {
    expect(sanitizePdfFormData('<p>hello</p>')).toBe('<p>hello</p>');
    expect(sanitizePdfFormData('plain text')).toBe('plain text');
  });

  it('handles malformed HTML', () => {
    expect(sanitizePdfFormData('<div><script>alert(1)</div>')).toBe('<div>alert(1)</div>');
    expect(sanitizePdfFormData('<img src="x"><a href="https://www.nav.no">good')).toBe(
      '<a href="https://www.nav.no">good',
    );
  });
});
