import { describe, expect, it } from 'vitest';
import { NavFormType, SubmissionData } from '../form';
import { yourInformationUtils } from '../index';

describe('getYourInformationUtils', () => {
  it('returns your information object when present in submission data', () => {
    const form = {
      components: [
        {
          key: 'yourInfo',
          yourInformation: true,
          label: '',
          type: '',
        },
      ],
    } as NavFormType;
    const submission: SubmissionData = {
      yourInfo: { name: 'John Doe' },
    };

    const result = yourInformationUtils.getYourInformation(form, submission);
    expect(result).toEqual({ name: 'John Doe' });
  });

  it('returns the first your information object present in submission data', () => {
    const form = {
      components: [
        {
          key: 'yourInfo',
          yourInformation: true,
          label: '',
          type: '',
        },
        {
          key: 'yourInfo2',
          yourInformation: true,
          label: '',
          type: '',
        },
      ],
    } as NavFormType;
    const submission: SubmissionData = {
      yourInfo2: { name: 'John Doe' },
      yourInfo: { name: 'Jane Doe' },
    };

    const result = yourInformationUtils.getYourInformation(form, submission);
    expect(result).toEqual({ name: 'Jane Doe' });
  });

  it('returns undefined when your information object is not present in submission data', () => {
    const form = {
      components: [
        {
          key: 'yourInfo',
          yourInformation: true,
          label: '',
          type: '',
        },
      ],
    } as NavFormType;
    const submission: SubmissionData = {};

    const result = yourInformationUtils.getYourInformation(form, submission);
    expect(result).toBeUndefined();
  });

  it('returns undefined when no your information component is found in form', () => {
    const form = {
      components: [
        {
          key: 'otherInfo',
          yourInformation: false,
          label: '',
          type: '',
        },
      ],
    } as NavFormType;
    const submission: SubmissionData = {
      otherInfo: { name: 'John Doe' },
    };

    const result = yourInformationUtils.getYourInformation(form, submission);
    expect(result).toBeUndefined();
  });
});
