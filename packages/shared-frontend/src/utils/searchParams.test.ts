import { updateSearch } from './searchParams';

describe('updateSearch', () => {
  it('updates and removes parameters while preserving unrelated parameters', () => {
    expect(updateSearch('?lang=nb&force=true', { lang: 'en', force: undefined, innsendingsId: '123' })).toBe(
      '?lang=en&innsendingsId=123',
    );
  });

  it('keeps empty values and omits the question mark for an empty query string', () => {
    expect(updateSearch('?value=old', { value: '' })).toBe('?value=');
    expect(updateSearch('?value=old', { value: undefined })).toBe('');
  });
});
