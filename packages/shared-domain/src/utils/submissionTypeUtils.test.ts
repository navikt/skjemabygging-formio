import {
  isDigitalSubmission,
  isDigitalSubmissionOnly,
  isNoneSubmission,
  isPaperSubmission,
  isPaperSubmissionOnly,
} from './submissionTypeUtils';

describe('Submission type utils', () => {
  describe('isDigitalSubmission', () => {
    it('should return true when submissionTypes contains DIGITAL', () => {
      expect(isDigitalSubmission(['DIGITAL'])).toBeTruthy();
    });

    it('should return true when submissionTypes contains PAPER and DIGITAL', () => {
      expect(isDigitalSubmission(['PAPER', 'DIGITAL'])).toBeTruthy();
    });

    it('should return false when submissionTypes contains only PAPER', () => {
      expect(isDigitalSubmission(['PAPER'])).toBeFalsy();
    });

    it('should return false when submissionTypes is an empty list', () => {
      expect(isDigitalSubmission([])).toBeFalsy();
    });
  });

  describe('isDigitalSubmissionOnly', () => {
    it('should return true when submissionTypes contains only DIGITAL', () => {
      expect(isDigitalSubmissionOnly(['DIGITAL'])).toBeTruthy();
    });

    it('should return false when submissionTypes contains both DIGITAL and PAPER', () => {
      expect(isDigitalSubmissionOnly(['PAPER', 'DIGITAL'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains only PAPER', () => {
      expect(isDigitalSubmissionOnly(['PAPER'])).toBeFalsy();
    });

    it('should return false when submissionTypes is an empty list', () => {
      expect(isDigitalSubmissionOnly([])).toBeFalsy();
    });
  });

  describe('isPaperSubmission', () => {
    it('should return true when submissionTypes contains PAPER', () => {
      expect(isPaperSubmission(['PAPER'])).toBeTruthy();
    });

    it('should return true when submissionTypes contains PAPER and DIGITAL', () => {
      expect(isPaperSubmission(['PAPER', 'DIGITAL'])).toBeTruthy();
    });

    it('should return false when submissionTypes contains only DIGITAL', () => {
      expect(isPaperSubmission(['DIGITAL'])).toBeFalsy();
    });

    it('should return false when submissionTypes is an empty list', () => {
      expect(isPaperSubmission([])).toBeFalsy();
    });
  });

  describe('isPaperSubmissionOnly', () => {
    it('should return true when submissionTypes contains only PAPER', () => {
      expect(isPaperSubmissionOnly(['PAPER'])).toBeTruthy();
    });

    it('should return false when submissionTypes contains both PAPER and DIGITAL', () => {
      expect(isPaperSubmissionOnly(['PAPER', 'DIGITAL'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains only DIGITAL', () => {
      expect(isPaperSubmissionOnly(['DIGITAL'])).toBeFalsy();
    });

    it('should return false when submissionTypes is an empty list', () => {
      expect(isPaperSubmissionOnly([])).toBeFalsy();
    });
  });

  describe('isNoneSubmission', () => {
    it('should return true when submissionTypes is an empty list', () => {
      expect(isNoneSubmission([])).toBeTruthy();
    });

    it('should return false when submissionTypes contains DIGITAL', () => {
      expect(isNoneSubmission(['DIGITAL'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains PAPER', () => {
      expect(isNoneSubmission(['PAPER'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains both PAPER and DIGITAL', () => {
      expect(isNoneSubmission(['PAPER', 'DIGITAL'])).toBeFalsy();
    });
  });
});
