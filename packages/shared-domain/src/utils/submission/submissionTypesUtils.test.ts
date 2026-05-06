import { submissionTypesUtils } from './submissionTypesUtils';

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

    it('should return true when submissionTypes contains DIGITAL and STATIC_PDF', () => {
      expect(submissionTypesUtils.isDigitalSubmissionOnly(['DIGITAL', 'STATIC_PDF'])).toBeTruthy();
    });

    it('should return false when submissionTypes contains both DIGITAL and PAPER', () => {
      expect(submissionTypesUtils.isDigitalSubmissionOnly(['PAPER', 'DIGITAL'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains DIGITAL, PAPER and STATIC_PDF', () => {
      expect(submissionTypesUtils.isDigitalSubmissionOnly(['PAPER', 'DIGITAL', 'STATIC_PDF'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains only PAPER', () => {
      expect(submissionTypesUtils.isDigitalSubmissionOnly(['PAPER'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains only STATIC_PDF', () => {
      expect(submissionTypesUtils.isDigitalSubmissionOnly(['STATIC_PDF'])).toBeFalsy();
    });

    it('should return false when submissionTypes is an empty list', () => {
      expect(submissionTypesUtils.isDigitalSubmissionOnly([])).toBeFalsy();
    });
  });

  describe('submissionTypesUtils.isDigitalNoLoginSubmissionOnly', () => {
    it('should return true when submissionTypes contains only DIGITAL_NO_LOGIN', () => {
      expect(submissionTypesUtils.isDigitalNoLoginSubmissionOnly(['DIGITAL_NO_LOGIN'])).toBeTruthy();
    });

    it('should return true when submissionTypes contains DIGITAL_NO_LOGIN and STATIC_PDF', () => {
      expect(submissionTypesUtils.isDigitalNoLoginSubmissionOnly(['DIGITAL_NO_LOGIN', 'STATIC_PDF'])).toBeTruthy();
    });

    it('should return false when submissionTypes contains DIGITAL_NO_LOGIN, DIGITAL and STATIC_PDF', () => {
      expect(
        submissionTypesUtils.isDigitalNoLoginSubmissionOnly(['DIGITAL_NO_LOGIN', 'DIGITAL', 'STATIC_PDF']),
      ).toBeFalsy();
    });

    it('should return false when submissionTypes contains only DIGITAL', () => {
      expect(submissionTypesUtils.isDigitalNoLoginSubmissionOnly(['DIGITAL'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains only STATIC_PDF', () => {
      expect(submissionTypesUtils.isDigitalNoLoginSubmissionOnly(['STATIC_PDF'])).toBeFalsy();
    });

    it('should return false when submissionTypes is an empty list', () => {
      expect(submissionTypesUtils.isDigitalNoLoginSubmissionOnly([])).toBeFalsy();
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

    it('should return true when submissionTypes contains PAPER and STATIC_PDF', () => {
      expect(submissionTypesUtils.isPaperSubmissionOnly(['PAPER', 'STATIC_PDF'])).toBeTruthy();
    });

    it('should return false when submissionTypes contains both PAPER and DIGITAL', () => {
      expect(submissionTypesUtils.isPaperSubmissionOnly(['PAPER', 'DIGITAL'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains PAPER, DIGITAL and STATIC_PDF', () => {
      expect(submissionTypesUtils.isPaperSubmissionOnly(['PAPER', 'DIGITAL', 'STATIC_PDF'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains only DIGITAL', () => {
      expect(submissionTypesUtils.isPaperSubmissionOnly(['DIGITAL'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains only STATIC_PDF', () => {
      expect(submissionTypesUtils.isPaperSubmissionOnly(['STATIC_PDF'])).toBeFalsy();
    });

    it('should return false when submissionTypes is an empty list', () => {
      expect(submissionTypesUtils.isPaperSubmissionOnly([])).toBeFalsy();
    });
  });

  describe('submissionTypesUtils.isPaperNoCoverPageSubmission', () => {
    it('should return true when submissionTypes is an empty list', () => {
      expect(submissionTypesUtils.isPaperNoCoverPageSubmission([])).toBeTruthy();
    });

    it('should return true when submissionTypes contains only PAPER_NO_COVER_PAGE', () => {
      expect(submissionTypesUtils.isPaperNoCoverPageSubmission(['PAPER_NO_COVER_PAGE'])).toBeTruthy();
    });

    it('should return true when submissionTypes contains PAPER_NO_COVER_PAGE and STATIC_PDF', () => {
      expect(submissionTypesUtils.isPaperNoCoverPageSubmission(['PAPER_NO_COVER_PAGE', 'STATIC_PDF'])).toBeTruthy();
    });

    it('should return true when submissionTypes contains PAPER_NO_COVER_PAGE and some other regular type', () => {
      expect(submissionTypesUtils.isPaperNoCoverPageSubmission(['PAPER_NO_COVER_PAGE', 'DIGITAL'])).toBeTruthy();
    });

    it('should return false when submissionTypes contains only STATIC_PDF', () => {
      expect(submissionTypesUtils.isPaperNoCoverPageSubmission(['STATIC_PDF'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains DIGITAL', () => {
      expect(submissionTypesUtils.isPaperNoCoverPageSubmission(['DIGITAL'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains PAPER', () => {
      expect(submissionTypesUtils.isPaperNoCoverPageSubmission(['PAPER'])).toBeFalsy();
    });

    it('should return false when submissionTypes contains both PAPER and DIGITAL', () => {
      expect(submissionTypesUtils.isPaperNoCoverPageSubmission(['PAPER', 'DIGITAL'])).toBeFalsy();
    });

    it('should return false when submissionTypes is undefined', () => {
      expect(submissionTypesUtils.isPaperNoCoverPageSubmission(undefined)).toBeFalsy();
    });
  });
});
