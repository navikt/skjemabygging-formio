import { describe, expect, it } from 'vitest';
import { NavFormType, SubmissionData } from '../../models';
import { senderUtils } from './senderUtils';

describe('senderUtils', () => {
  describe('getSender', () => {
    it('returns the sender object when it is at the top level', () => {
      const form = {
        components: [
          {
            key: 'mottakerPerson',
            type: 'sender',
            input: true,
          },
        ],
      } as NavFormType;
      const submissionData: SubmissionData = {
        mottakerPerson: { person: { firstName: 'John' } },
      };

      const result = senderUtils.getSender(form, submissionData);
      expect(result).toEqual({ person: { firstName: 'John' } });
    });

    it('returns the sender object when it is nested inside containers', () => {
      const form = {
        components: [
          {
            key: 'containerOrganization',
            type: 'container',
            tree: true,
            components: [
              {
                key: 'containerOrganizationNested',
                type: 'container',
                tree: true,
                components: [
                  {
                    key: 'mottakerOrganisasjon',
                    type: 'sender',
                    input: true,
                  },
                ],
              },
            ],
          },
        ],
      } as unknown as NavFormType;
      const submissionData: SubmissionData = {
        containerOrganization: {
          containerOrganizationNested: {
            mottakerOrganisasjon: { organization: { name: 'Acme' } },
          },
        },
      };

      const result = senderUtils.getSender(form, submissionData);
      expect(result).toEqual({ organization: { name: 'Acme' } });
    });

    it('ignores a sender component inside a non-nesting container (e.g. panel)', () => {
      const form = {
        components: [
          {
            key: 'panel',
            type: 'panel',
            input: false,
            tree: false,
            components: [
              {
                key: 'mottakerPerson',
                type: 'sender',
                input: true,
              },
            ],
          },
        ],
      } as unknown as NavFormType;
      const submissionData: SubmissionData = {
        mottakerPerson: { person: { firstName: 'John' } },
      };

      const result = senderUtils.getSender(form, submissionData);
      expect(result).toEqual({ person: { firstName: 'John' } });
    });

    it('returns the populated sender when multiple sender components exist but only one has a value', () => {
      const form = {
        components: [
          {
            key: 'mottakerPerson',
            type: 'sender',
            input: true,
          },
          {
            key: 'containerOrganization',
            type: 'container',
            tree: true,
            components: [
              {
                key: 'mottakerOrganisasjon',
                type: 'sender',
                input: true,
              },
            ],
          },
        ],
      } as unknown as NavFormType;
      const submissionData: SubmissionData = {
        containerOrganization: {
          mottakerOrganisasjon: { organization: { name: 'Acme' } },
        },
      };

      const result = senderUtils.getSender(form, submissionData);
      expect(result).toEqual({ organization: { name: 'Acme' } });
    });

    it('returns undefined when the sender component has no value', () => {
      const form = {
        components: [
          {
            key: 'mottakerPerson',
            type: 'sender',
            input: true,
          },
        ],
      } as NavFormType;
      const submissionData: SubmissionData = {};

      const result = senderUtils.getSender(form, submissionData);
      expect(result).toBeUndefined();
    });

    it('returns undefined when no sender component exists in the form', () => {
      const form = {
        components: [
          {
            key: 'someText',
            type: 'textfield',
            input: true,
          },
        ],
      } as NavFormType;
      const submissionData: SubmissionData = {
        someText: 'value',
      };

      const result = senderUtils.getSender(form, submissionData);
      expect(result).toBeUndefined();
    });
  });
});
