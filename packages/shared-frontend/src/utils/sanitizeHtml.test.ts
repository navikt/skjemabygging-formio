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
});
