import { isDigitalSubmission, isPaperSubmission } from './submissionTypeUtils';

describe('Submission type utils', () => {
  describe('isDigitalSubmission', () => {
    it('should return true when innsending contains KUN_DIGITAL', () => {
      expect(isDigitalSubmission(['KUN_DIGITAL'])).toBeTruthy();
    });

    it('should return true when innsending contains PAPIR_OG_DIGITAL', () => {
      expect(isDigitalSubmission(['PAPIR_OG_DIGITAL'])).toBeTruthy();
    });

    it('should return true when innsending contains both KUN_DIGITAL and PAPIR_OG_DIGITAL', () => {
      expect(isDigitalSubmission(['KUN_DIGITAL', 'PAPIR_OG_DIGITAL'])).toBeTruthy();
    });

    it('should return false when innsending contains only KUN_PAPIR', () => {
      expect(isDigitalSubmission(['KUN_PAPIR'])).toBeFalsy();
    });

    it('should return false when innsending contains only INGEN', () => {
      expect(isDigitalSubmission(['INGEN'])).toBeFalsy();
    });

    it('should return false when innsending is an empty list', () => {
      expect(isDigitalSubmission([])).toBeFalsy();
    });
  });

  describe('isPaperSubmission', () => {
    it('should return true when innsending contains KUN_PAPIR', () => {
      expect(isPaperSubmission(['KUN_PAPIR'])).toBeTruthy();
    });

    it('should return true when innsending contains PAPIR_OG_DIGITAL', () => {
      expect(isPaperSubmission(['PAPIR_OG_DIGITAL'])).toBeTruthy();
    });

    it('should return true when innsending contains both KUN_PAPIR and PAPIR_OG_DIGITAL', () => {
      expect(isPaperSubmission(['KUN_PAPIR', 'PAPIR_OG_DIGITAL'])).toBeTruthy();
    });

    it('should return false when innsending contains only KUN_DIGITAL', () => {
      expect(isPaperSubmission(['KUN_DIGITAL'])).toBeFalsy();
    });

    it('should return false when innsending contains only INGEN', () => {
      expect(isPaperSubmission(['INGEN'])).toBeFalsy();
    });

    it('should return false when innsending is an empty list', () => {
      expect(isPaperSubmission([])).toBeFalsy();
    });
  });
});
