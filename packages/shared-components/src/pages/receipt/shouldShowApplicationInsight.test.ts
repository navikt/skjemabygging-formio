import { NavFormType, SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { shouldShowApplicationInsight } from './shouldShowApplicationInsight';

const form = {
  components: [
    {
      key: 'yourInformation',
      type: 'container',
      yourInformation: true,
    },
    {
      key: 'sender',
      type: 'sender',
      input: true,
    },
  ],
} as NavFormType;

const submissionData: SubmissionData = {
  yourInformation: {
    identitet: {
      identitetsnummer: '12345678901',
    },
  },
};

describe('shouldShowApplicationInsight', () => {
  it('returns false for unsupported submission methods', () => {
    expect(
      shouldShowApplicationInsight({
        form,
        submissionData: {
          ...submissionData,
          sender: {
            person: {
              nationalIdentityNumber: '10987654321',
            },
          },
        },
        submissionMethod: 'paper',
      }),
    ).toBe(false);
  });

  it('returns false when sender is the same person as your information', () => {
    expect(
      shouldShowApplicationInsight({
        form,
        submissionData: {
          ...submissionData,
          sender: {
            person: {
              nationalIdentityNumber: '12345678901',
            },
          },
        },
        submissionMethod: 'digital',
      }),
    ).toBe(false);
  });

  it('returns true when a different person is the sender', () => {
    expect(
      shouldShowApplicationInsight({
        form,
        submissionData: {
          ...submissionData,
          sender: {
            person: {
              nationalIdentityNumber: '10987654321',
            },
          },
        },
        submissionMethod: 'digital',
      }),
    ).toBe(true);
  });

  it('returns true when an organization is the sender in digital no login', () => {
    expect(
      shouldShowApplicationInsight({
        form,
        submissionData: {
          ...submissionData,
          sender: {
            organization: {
              number: '999888777',
              name: 'Test Organization',
            },
          },
        },
        submissionMethod: 'digitalnologin',
      }),
    ).toBe(true);
  });

  it('returns false when no sender exists', () => {
    expect(
      shouldShowApplicationInsight({
        form,
        submissionData,
        submissionMethod: 'digital',
      }),
    ).toBe(false);
  });
});
