import { submissionTypesUtils } from '../index';

describe('Submission type utils', () => {
  describe('submissionTypesUtils.isDigitalSubmission', () => {
    it('should return true when submissionTypes contains DIGITAL', () => {
      expect(submissionTypesUtils.isDigitalSubmission(['DIGITAL'])).toBeTruthy();
    });

    it('should return true when submissionTypes contains PAPER and DIGITAL', () => {
      expect(submissionTypesUtils.isDigitalSubmission(['PAPER', 'DIGITAL'])).toBeTruthy();
    });

    it('should return false when submissionTypes contains only PAPER', () => {
      expect(submissionTypesUtils.isDigitalSubmission(['PAPER'])).toBeFalsy();
    });

    it('should return false when submissionTypes is an empty list', () => {
      expect(submissionTypesUtils.isDigitalSubmission([])).toBeFalsy();
    });
  });

  describe('submissionTypesUtils.isDigitalSubmissionOnly', () => {
    it('should return true when submissionTypes contains only DIGITAL', () => {
      expect(submissionTypesUtils.isDigitalSubmissionOnly(['DIGITAL'])).toBeTruthy();
    });

    it('should return false when submissionTypes contains both DIGITAL and PAPER', () => {
      expect(submissionTypesUtils.isDigitalSubmissionOnly(['PAPER', 'DIGITAL'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains only PAPER', () => {
      expect(submissionTypesUtils.isDigitalSubmissionOnly(['PAPER'])).toBeFalsy();
    });

    it('should return false when submissionTypes is an empty list', () => {
      expect(submissionTypesUtils.isDigitalSubmissionOnly([])).toBeFalsy();
    });
  });

  describe('submissionTypesUtils.isPaperSubmission', () => {
    it('should return true when submissionTypes contains PAPER', () => {
      expect(submissionTypesUtils.isPaperSubmission(['PAPER'])).toBeTruthy();
    });

    it('should return true when submissionTypes contains PAPER and DIGITAL', () => {
      expect(submissionTypesUtils.isPaperSubmission(['PAPER', 'DIGITAL'])).toBeTruthy();
    });

    it('should return false when submissionTypes contains only DIGITAL', () => {
      expect(submissionTypesUtils.isPaperSubmission(['DIGITAL'])).toBeFalsy();
    });

    it('should return false when submissionTypes is an empty list', () => {
      expect(submissionTypesUtils.isPaperSubmission([])).toBeFalsy();
    });
  });

  describe('submissionTypesUtils.isPaperSubmissionOnly', () => {
    it('should return true when submissionTypes contains only PAPER', () => {
      expect(submissionTypesUtils.isPaperSubmissionOnly(['PAPER'])).toBeTruthy();
    });

    it('should return false when submissionTypes contains both PAPER and DIGITAL', () => {
      expect(submissionTypesUtils.isPaperSubmissionOnly(['PAPER', 'DIGITAL'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains only DIGITAL', () => {
      expect(submissionTypesUtils.isPaperSubmissionOnly(['DIGITAL'])).toBeFalsy();
    });

    it('should return false when submissionTypes is an empty list', () => {
      expect(submissionTypesUtils.isPaperSubmissionOnly([])).toBeFalsy();
    });
  });

  describe('submissionTypesUtils.isNoneSubmission', () => {
    it('should return true when submissionTypes is an empty list', () => {
      expect(submissionTypesUtils.isNoneSubmission([])).toBeTruthy();
    });

    it('should return false when submissionTypes contains DIGITAL', () => {
      expect(submissionTypesUtils.isNoneSubmission(['DIGITAL'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains PAPER', () => {
      expect(submissionTypesUtils.isNoneSubmission(['PAPER'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains both PAPER and DIGITAL', () => {
      expect(submissionTypesUtils.isNoneSubmission(['PAPER', 'DIGITAL'])).toBeFalsy();
    });
  });
});
