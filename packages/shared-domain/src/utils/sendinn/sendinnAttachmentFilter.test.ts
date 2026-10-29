import { normalizeSendinnAttachmentFilter } from './sendinnAttachmentFilter';

describe('normalizeSendinnAttachmentFilter', () => {
  it.each<{ input?: string | readonly string[]; expected: string[] }>([
    { input: undefined, expected: [] },
    { input: '', expected: [] },
    { input: ' , \t, ', expected: [] },
    { input: [], expected: [] },
    { input: ['', ' , ', '\t'], expected: [] },
    { input: ' N6, N1 ,, N2 ', expected: ['N6', 'N1', 'N2'] },
    { input: [' N6, N1 ', ',', 'N2,, N6'], expected: ['N6', 'N1', 'N2', 'N6'] },
    { input: 'unknown', expected: ['unknown'] },
  ])('normalizes $input to $expected', ({ input, expected }) => {
    expect(normalizeSendinnAttachmentFilter(input)).toEqual(expected);
  });

  it('accepts repeated URL query values without changing their order or case', () => {
    const query = new URLSearchParams('filter=N6%2C+N1&filter=+n2+&filter=');
    expect(normalizeSendinnAttachmentFilter(query.getAll('filter'))).toEqual(['N6', 'N1', 'n2']);
  });
});
