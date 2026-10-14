import { describe, expect, it } from 'vitest';
import { isLanguageAllowedForForm } from './publishedLanguagesUtils';

describe('isLanguageAllowedForForm', () => {
  it.each(['en', 'pl'])('rejects unpublished language %s', (language) => {
    expect(isLanguageAllowedForForm(language, { status: 'published', publishedLanguages: ['nb', 'nn'] })).toBe(false);
  });

  it.each(['nb', 'nb-NO', 'no'])('always allows bokmal alias %s', (language) => {
    expect(isLanguageAllowedForForm(language, { status: 'published', publishedLanguages: ['en'] })).toBe(true);
  });

  it.each(['nn', 'nn-NO'])('accepts nynorsk alias %s with either metadata format', (language) => {
    expect(isLanguageAllowedForForm(language, { status: 'published', publishedLanguages: ['nn'] })).toBe(true);
    expect(isLanguageAllowedForForm(language, { status: 'published', publishedLanguages: ['nn-NO'] })).toBe(true);
  });

  it('accepts published English', () => {
    expect(isLanguageAllowedForForm('en', { status: 'published', publishedLanguages: ['en'] })).toBe(true);
  });

  it('rejects translations when the published list is empty', () => {
    expect(isLanguageAllowedForForm('en', { status: 'published', publishedLanguages: [] })).toBe(false);
  });

  it.each(['draft', 'pending', 'unpublished', undefined])('does not restrict revisions with status %s', (status) => {
    expect(isLanguageAllowedForForm('en', { status, publishedLanguages: ['nb'] })).toBe(true);
  });

  it('does not restrict languages when publication metadata is missing', () => {
    expect(isLanguageAllowedForForm('en', { status: 'published' })).toBe(true);
  });

  it.each([undefined, ''])('ignores an absent language %s', (language) => {
    expect(isLanguageAllowedForForm(language, { status: 'published', publishedLanguages: ['nb'] })).toBe(true);
  });
});
