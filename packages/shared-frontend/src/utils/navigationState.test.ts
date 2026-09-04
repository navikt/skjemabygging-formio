import { describe, expect, it } from 'vitest';
import { withoutSubmissionNavigationState } from './navigationState';

describe('withoutSubmissionNavigationState', () => {
  it('removes submission snapshots while preserving route-local state', () => {
    expect(
      withoutSubmissionNavigationState({
        initialSubmission: { data: { textField: 'sensitive value' } },
        preserveInitialSubmission: true,
        focusId: 'textField',
        validationErrorPages: ['your-information'],
      }),
    ).toEqual({
      focusId: 'textField',
      validationErrorPages: ['your-information'],
    });
  });
});
