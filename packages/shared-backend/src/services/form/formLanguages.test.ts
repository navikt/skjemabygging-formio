import { resolveFormLanguages } from './formLanguages';

describe('resolveFormLanguages', () => {
  it('offers every language when unpublished languages are included', () => {
    expect(resolveFormLanguages({ publishedLanguages: ['nb'] }, true)).toEqual(['nb', 'nn', 'en']);
  });

  it('offers only published languages, always including bokmål, otherwise', () => {
    expect(resolveFormLanguages({ publishedLanguages: ['nn', 'en', 'nb'] }, false)).toEqual(['nb', 'nn', 'en']);
    expect(resolveFormLanguages({ publishedLanguages: ['nn-NO'] }, false)).toEqual(['nb', 'nn']);
    expect(resolveFormLanguages({ publishedLanguages: undefined }, false)).toEqual(['nb']);
  });
});
