import { describe, expect, it } from 'vitest';
import { NavFormType, SubmissionData } from '../../models';
import { yourInformationUtils } from './yourInformationUtils';

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
      yourInfo: { fornavn: 'John' },
    };

    const result = yourInformationUtils.getYourInformation(form, submission);
    expect(result).toEqual({ fornavn: 'John' });
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
      yourInfo2: { fornavn: 'John' },
      yourInfo: { fornavn: 'Jane' },
    };

    const result = yourInformationUtils.getYourInformation(form, submission);
    expect(result).toEqual({ fornavn: 'Jane' });
  });

  it('skips your information objects without identity number or name', () => {
    const form = {
      components: [
        { key: 'onBehalfOfOthers', yourInformation: true, label: '', type: '' },
        { key: 'self', yourInformation: true, label: '', type: '' },
      ],
    } as NavFormType;
    const self = { identitet: { identitetsnummer: '12345678911' }, fornavn: 'Ola', etternavn: 'Nordmann' };
    const submission: SubmissionData = {
      onBehalfOfOthers: { fornavn: '', etternavn: ' ', identitet: { identitetsnummer: '' } },
      self,
    };

    const result = yourInformationUtils.getYourInformation(form, submission);
    expect(result).toEqual(self);
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
