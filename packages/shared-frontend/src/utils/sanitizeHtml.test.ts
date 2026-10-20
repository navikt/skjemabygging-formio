// @vitest-environment jsdom

import DOMPurify from 'dompurify';
import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('adds rel noopener noreferrer to target blank links', () => {
    expect(sanitizeHtml('<a href="https://nav.no" target="_blank">Nav</a>')).toContain('rel="noopener noreferrer"');
  });

  it('preserves existing rel values while forcing noopener noreferrer', () => {
    expect(sanitizeHtml('<a href="https://nav.no" target="_blank" rel="external">Nav</a>')).toContain(
      'rel="external noopener noreferrer"',
    );
  });

  it('sanitizes repeated content only once', () => {
    const sanitizeSpy = vi.spyOn(DOMPurify, 'sanitize');
    const content = '<p onclick="alert(1)">Cached</p>';

    const first = sanitizeHtml(content);
    const callsAfterFirst = sanitizeSpy.mock.calls.length;
    const second = sanitizeHtml(content);

    expect(second).toBe(first);
    expect(second).toBe('<p>Cached</p>');
    expect(sanitizeSpy.mock.calls.length).toBe(callsAfterFirst);
    sanitizeSpy.mockRestore();
  });
});
