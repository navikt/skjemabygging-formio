import paginationUtils from './pagination';

describe('pagination', () => {
  describe('retrieveRangeOfList', () => {
    const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];

    it('returns an empty list when it receives an empty list', () => {
      expect(paginationUtils.retrieveRangeOfList([], 4, 2)).toEqual([]);
    });

    it('returns the first four elements when page is 1 and max is 4', () => {
      expect(paginationUtils.retrieveRangeOfList(alphabet, 1, 4)).toEqual(['a', 'b', 'c', 'd']);
    });

    it('returns the third and fourth elements when page is 2 and max is 2', () => {
      expect(paginationUtils.retrieveRangeOfList(alphabet, 2, 2)).toEqual(['c', 'd']);
    });

    it('returns the last two of twelve elements when page is 2 and max is 10', () => {
      expect(paginationUtils.retrieveRangeOfList(alphabet, 2, 10)).toEqual(['k', 'l']);
    });

    it('returns the last two of twelve elements when page is 6 and max is 2', () => {
      expect(paginationUtils.retrieveRangeOfList(alphabet, 6, 2)).toEqual(['k', 'l']);
    });

    it('returns an empty list when page is 3 and max is the length of the list', () => {
      expect(paginationUtils.retrieveRangeOfList(alphabet, 3, 12)).toEqual([]);
    });
  });
});
