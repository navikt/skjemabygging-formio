import { resolveFormLanguages } from './formLanguages';

describe('resolveFormLanguages', () => {
  describe('when unpublished languages are included', () => {
    it('offers every language for a form that is not published', () => {
      expect(resolveFormLanguages({ status: 'pending', publishedLanguages: ['nb'] }, true)).toEqual(['nb', 'nn', 'en']);
      expect(resolveFormLanguages({ status: 'draft' }, true)).toEqual(['nb', 'nn', 'en']);
    });

    it('offers only published languages, always including bokmål, for a published form', () => {
      expect(resolveFormLanguages({ status: 'published', publishedLanguages: ['nn-NO'] }, true)).toEqual(['nb', 'nn']);
      expect(resolveFormLanguages({ status: 'published', publishedLanguages: [] }, true)).toEqual(['nb']);
    });

    it('offers every language for a published form without published languages', () => {
      expect(resolveFormLanguages({ status: 'published' }, true)).toEqual(['nb', 'nn', 'en']);
    });
  });

  it('offers only published languages, always including bokmål, otherwise', () => {
    expect(resolveFormLanguages({ publishedLanguages: ['nn', 'en', 'nb'] }, false)).toEqual(['nb', 'nn', 'en']);
    expect(resolveFormLanguages({ publishedLanguages: ['nn-NO'] }, false)).toEqual(['nb', 'nn']);
    expect(resolveFormLanguages({ publishedLanguages: undefined }, false)).toEqual(['nb']);
  });
});
