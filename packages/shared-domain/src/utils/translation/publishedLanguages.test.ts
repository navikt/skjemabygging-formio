import { describe, expect, it } from 'vitest';
import { isUnpublishedLanguage } from './publishedLanguages';

describe('isUnpublishedLanguage', () => {
  it.each(['en', 'pl'])('rejects unpublished language %s', (language) => {
    expect(isUnpublishedLanguage(language, { status: 'published', publishedLanguages: ['nb', 'nn'] })).toBe(true);
  });

  it.each(['nb', 'nb-NO', 'no'])('always allows bokmal alias %s', (language) => {
    expect(isUnpublishedLanguage(language, { status: 'published', publishedLanguages: ['en'] })).toBe(false);
  });

  it.each(['nn', 'nn-NO'])('accepts nynorsk alias %s with either metadata format', (language) => {
    expect(isUnpublishedLanguage(language, { status: 'published', publishedLanguages: ['nn'] })).toBe(false);
    expect(isUnpublishedLanguage(language, { status: 'published', publishedLanguages: ['nn-NO'] })).toBe(false);
  });

  it('accepts published English', () => {
    expect(isUnpublishedLanguage('en', { status: 'published', publishedLanguages: ['en'] })).toBe(false);
  });

  it('rejects translations when the published list is empty', () => {
    expect(isUnpublishedLanguage('en', { status: 'published', publishedLanguages: [] })).toBe(true);
  });

  it.each(['draft', 'pending', 'unpublished', undefined])('does not restrict revisions with status %s', (status) => {
    expect(isUnpublishedLanguage('en', { status, publishedLanguages: ['nb'] })).toBe(false);
  });

  it('does not restrict languages when publication metadata is missing', () => {
    expect(isUnpublishedLanguage('en', { status: 'published' })).toBe(false);
  });

  it.each([undefined, ''])('ignores an absent language %s', (language) => {
    expect(isUnpublishedLanguage(language, { status: 'published', publishedLanguages: ['nb'] })).toBe(false);
  });
});
