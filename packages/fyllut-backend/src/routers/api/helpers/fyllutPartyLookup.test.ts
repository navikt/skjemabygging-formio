import { Component, Form, resolveParty, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { createFyllutPartyLookup } from './fyllutPartyLookup';

const form = {
  components: [
    { type: 'container', key: 'yourInformation', yourInformation: true, input: true },
    { type: 'sender', key: 'sender', input: true },
  ] as Component[],
} as Form;

describe('createFyllutPartyLookup', () => {
  it('reads party values from Fyllut components', () => {
    const submission: Submission = {
      data: {
        yourInformation: {
          fornavn: 'User',
          etternavn: 'Usersen',
          identitet: { identitetsnummer: '12345678911' },
        },
        sender: {
          organization: {
            name: 'Organization',
            number: '889640782',
          },
        },
      },
    };

    expect(resolveParty(submission, createFyllutPartyLookup(form))).toEqual({
      relationship: 'organization',
      sender: { name: 'Organization', organizationNumber: '889640782' },
      user: { kind: 'identified-person', nationalIdentityNumber: '12345678911' },
    });
  });
});
