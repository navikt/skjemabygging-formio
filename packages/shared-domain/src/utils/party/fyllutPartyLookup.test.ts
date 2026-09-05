import { Component, Form, Submission } from '../../models';
import { createFyllutPartyLookup } from './fyllutPartyLookup';
import { resolveParty } from './partyResolver';

const form = {
  components: [
    { type: 'container', key: 'yourInformation', yourInformation: true, input: true },
    { type: 'sender', key: 'sender', input: true },
  ] as Component[],
} as Form;

describe('createFyllutPartyLookup', () => {
  it('derives canonical party values from a production form definition', () => {
    const submission: Submission = {
      data: {
        yourInformation: {
          fornavn: 'User',
          etternavn: 'Usersen',
          identitet: { identitetsnummer: '123 456 789 11' },
        },
        sender: {
          organization: {
            name: 'Organization',
            number: '889 640 782',
          },
        },
      },
    };

    expect(resolveParty(submission, createFyllutPartyLookup(form))).toEqual({
      success: true,
      party: {
        relationship: 'organization',
        sender: { name: 'Organization', organizationNumber: '889640782' },
        user: { kind: 'identified-person', nationalIdentityNumber: '12345678911' },
      },
    });
  });

  it('adapts a flat legacy identified user', () => {
    const submission: Submission = {
      data: {
        fodselsnummerDNummerSoker: '123 456 789 11',
      },
    };

    expect(resolveParty(submission, createFyllutPartyLookup({ ...form, components: [] }))).toEqual({
      success: true,
      party: {
        relationship: 'self',
        user: { kind: 'identified-person', nationalIdentityNumber: '12345678911' },
      },
    });
  });

  it('keeps a name-only user as an explicit unsupported compatibility shape', () => {
    const submission: Submission = {
      data: {
        yourInformation: {
          fornavn: 'Name',
          etternavn: 'Only',
        },
      },
    };

    expect(resolveParty(submission, createFyllutPartyLookup(form))).toEqual({
      success: false,
      error: 'missing-user-address',
    });
  });

  it('keeps a flat legacy name-only user as an explicit unsupported compatibility shape', () => {
    const submission: Submission = {
      data: {
        fornavnSoker: 'Name',
        etternavnSoker: 'Only',
      },
    };

    expect(resolveParty(submission, createFyllutPartyLookup({ ...form, components: [] }))).toEqual({
      success: false,
      error: 'missing-user-address',
    });
  });

  it('can preserve the application mapping legacy identity fallback', () => {
    const submission: Submission = {
      data: {
        yourInformation: {
          fornavn: 'User',
          etternavn: 'Usersen',
          adresse: { adresse: 'Testveien 1' },
        },
        fodselsnummerDNummerSoker: '123 456 789 11',
      },
    };

    expect(resolveParty(submission, createFyllutPartyLookup(form, { legacyIdentityFallback: true }))).toEqual({
      success: true,
      party: {
        relationship: 'self',
        user: { kind: 'identified-person', nationalIdentityNumber: '12345678911' },
      },
    });
  });
});
