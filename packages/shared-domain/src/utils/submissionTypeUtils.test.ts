import { isDigitalSubmission, isPaperSubmission } from './submissionTypeUtils';

describe('Submission type utils', () => {
  describe('isDigitalSubmission', () => {
    it('should return true when innsending contains DIGITAL', () => {
      expect(isDigitalSubmission(['DIGITAL'])).toBeTruthy();
    });

    it('should return true when innsending contains PAPIR_OG_DIGITAL', () => {
      expect(isDigitalSubmission(['PAPER', 'DIGITAL'])).toBeTruthy();
    });

    it('should return true when innsending contains both DIGITAL and PAPIR_OG_DIGITAL', () => {
      expect(isDigitalSubmission(['PAPER', 'DIGITAL'])).toBeTruthy();
    });

    it('should return false when innsending contains only PAPER', () => {
      expect(isDigitalSubmission(['PAPER'])).toBeFalsy();
    });

    it('should return false when innsending is an empty list', () => {
      expect(isDigitalSubmission([])).toBeFalsy();
    });
  });

  describe('isPaperSubmission', () => {
    it('should return true when innsending contains PAPER', () => {
      expect(isPaperSubmission(['PAPER'])).toBeTruthy();
    });

    it('should return true when innsending contains DIGITAL', () => {
      expect(isPaperSubmission(['PAPER', 'DIGITAL'])).toBeTruthy();
    });

    it('should return true when innsending contains both PAPER and DIGITAL', () => {
      expect(isPaperSubmission(['PAPER', 'DIGITAL'])).toBeTruthy();
    });

    it('should return false when innsending contains only DIGITAL', () => {
      expect(isPaperSubmission(['DIGITAL'])).toBeFalsy();
    });

    it('should return false when innsending is an empty list', () => {
      expect(isPaperSubmission([])).toBeFalsy();
    });
  });
});
