import urlUtil from './urlUtil';

describe('urlUtil', () => {
  describe('isValidPath', () => {
    describe('Validation', () => {
      it('Valid', () => {
        expect(urlUtil.isValidPath('asdf', false)).toBeTruthy();
        expect(urlUtil.isValidPath('asdf-123', false)).toBeTruthy();
        expect(urlUtil.isValidPath('123', false)).toBeTruthy();
        expect(urlUtil.isValidPath('123_456', false)).toBeTruthy();
      });

      it('Invalid', () => {
        expect(urlUtil.isValidPath('as df', false)).toBeFalsy();
        expect(urlUtil.isValidPath('asdf#123', false)).toBeFalsy();
        expect(urlUtil.isValidPath('123.', false)).toBeFalsy();
      });
    });

    describe('Strict validation', () => {
      it('Valid', () => {
        expect(urlUtil.isValidPath('asdf')).toBeTruthy();
        expect(urlUtil.isValidPath('asdf123')).toBeTruthy();
        expect(urlUtil.isValidPath('123')).toBeTruthy();
      });

      it('Invalid', () => {
        expect(urlUtil.isValidPath('as df')).toBeFalsy();
        expect(urlUtil.isValidPath('asdf#123')).toBeFalsy();
        expect(urlUtil.isValidPath('asdf-123')).toBeFalsy();
        expect(urlUtil.isValidPath('123_456')).toBeFalsy();
        expect(urlUtil.isValidPath('123.')).toBeFalsy();
      });
    });
  });
});
