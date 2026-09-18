import { Component, Form, Submission } from '../../models';
import { resolveParty } from './partyResolver';

const form = {
  components: [
    { type: 'container', key: 'yourInformation', yourInformation: true, input: true },
    { type: 'sender', key: 'sender', input: true },
  ] as Component[],
} as Form;

const resolve = (data: Submission['data']) => resolveParty(form, { data });

describe('resolveParty', () => {
  it('returns undefined when the form does not locate user information', () => {
    expect(resolveParty({ components: [] } as unknown as Form, { data: {} })).toBeUndefined();
  });

  it('resolves canonical user data when the form has no Sender component', () => {
    const selfOnlyForm = {
      components: [{ type: 'container', key: 'yourInformation', yourInformation: true, input: true }],
    } as Form;

    expect(
      resolveParty(selfOnlyForm, {
        data: {
          yourInformation: {
            identitet: { identitetsnummer: '123 456 789 11' },
          },
        },
      }),
    ).toEqual({
      onBehalfOf: 'self',
      user: { kind: 'identified-person', nationalIdentityNumber: '123 456 789 11' },
    });
  });

  it('resolves an identified person acting on their own behalf without changing input values', () => {
    expect(
      resolve({
        yourInformation: {
          fornavn: 'Test',
          etternavn: 'Testesen',
          identitet: { identitetsnummer: '123 456 789 11' },
        },
      }),
    ).toEqual({
      onBehalfOf: 'self',
      user: { kind: 'identified-person', nationalIdentityNumber: '123 456 789 11' },
    });
  });

  it('trusts an address produced by the user-information component', () => {
    const address = {
      adresse: 'Testveien 1',
      postnummer: '0101',
      bySted: 'Oslo',
      land: { value: 'NO', label: 'Norge' },
    };

    expect(
      resolve({
        yourInformation: {
          fornavn: 'Test',
          etternavn: 'Testesen',
          adresse: address,
        },
      }),
    ).toEqual({
      onBehalfOf: 'self',
      user: {
        kind: 'unidentified-person',
        firstName: 'Test',
        surname: 'Testesen',
        address: {
          streetAddress: 'Testveien 1',
          postalCode: '0101',
          postalName: 'Oslo',
          country: { value: 'NO', label: 'Norge' },
        },
      },
    });
  });

  it('resolves a person acting for another identified person', () => {
    expect(
      resolve({
        yourInformation: {
          fornavn: 'User',
          etternavn: 'Usersen',
          identitet: { identitetsnummer: '123 456 789 11' },
        },
        sender: {
          person: {
            firstName: 'Sender',
            surname: 'Sendersen',
            nationalIdentityNumber: '109 876 543 21',
          },
        },
      }),
    ).toEqual({
      onBehalfOf: 'other-person',
      sender: {
        firstName: 'Sender',
        surname: 'Sendersen',
        nationalIdentityNumber: '109 876 543 21',
      },
      user: { kind: 'identified-person', nationalIdentityNumber: '123 456 789 11' },
    });
  });

  it('resolves an organization acting for an unidentified person', () => {
    expect(
      resolve({
        yourInformation: {
          fornavn: 'User',
          etternavn: 'Usersen',
          adresse: { postnummer: '0101' },
        },
        sender: {
          organization: {
            name: 'Organization',
            number: '889 640 782',
          },
        },
      }),
    ).toEqual({
      onBehalfOf: 'other-person',
      sender: { name: 'Organization', number: '889 640 782' },
      user: {
        kind: 'unidentified-person',
        firstName: 'User',
        surname: 'Usersen',
        address: { postalCode: '0101' },
      },
    });
  });

  it('resolves an organization acting on its own behalf without a NAV unit', () => {
    expect(
      resolve({
        sender: {
          organization: {
            name: 'Organization',
            number: '889 640 782',
          },
        },
      }),
    ).toEqual({
      onBehalfOf: 'self',
      user: { name: 'Organization', number: '889 640 782' },
    });
  });

  it('resolves an organization acting for multiple people when the journey provides a NAV unit', () => {
    expect(
      resolveParty(
        form,
        {
          data: {
            sender: {
              organization: {
                name: 'Organization',
                number: '889 640 782',
              },
            },
          },
        },
        { navUnit: '9999' },
      ),
    ).toEqual({
      onBehalfOf: 'multiple-people',
      sender: { name: 'Organization', number: '889 640 782' },
      navUnit: '9999',
    });
  });

  it('returns undefined when no user or sender is submitted', () => {
    expect(resolve({})).toBeUndefined();
  });

  it('does not resolve a cover-page-specific organization field', () => {
    const coverPageForm = {
      components: [
        {
          type: 'orgNr',
          key: 'organizationNumber',
          coverPageUser: true,
        },
      ] as Component[],
    } as Form;

    expect(resolveParty(coverPageForm, { data: { organizationNumber: '889 640 782' } })).toBeUndefined();
  });

  it('resolves a flat identified user with a modern sender', () => {
    const legacyForm = {
      components: [{ type: 'sender', key: 'sender', input: true }],
    } as Form;
    expect(
      resolveParty(legacyForm, {
        data: {
          fodselsnummerDNummerSoker: '222 222 222 22',
          sender: {
            organization: {
              name: 'Organization',
              number: '889 640 782',
            },
          },
        },
      }),
    ).toEqual({
      onBehalfOf: 'other-person',
      sender: { name: 'Organization', number: '889 640 782' },
      user: { kind: 'identified-person', nationalIdentityNumber: '222 222 222 22' },
    });
  });

  it('resolves a flat unidentified user', () => {
    const legacyForm = { components: [] } as unknown as Form;

    expect(
      resolveParty(legacyForm, {
        data: {
          fornavnSoker: 'Legacy',
          etternavnSoker: 'User',
          gateadresseSoker: 'Testveien 1',
        },
      }),
    ).toEqual({
      onBehalfOf: 'self',
      user: {
        kind: 'unidentified-person',
        firstName: 'Legacy',
        surname: 'User',
        address: {
          streetAddress: 'Testveien 1',
          country: { value: '', label: '' },
        },
      },
    });
  });

  it('resolves a legacy sender without component declarations', () => {
    const legacyForm = { components: [] } as unknown as Form;

    expect(
      resolveParty(legacyForm, {
        data: {
          fodselsnummerDNummerSoker: '123 456 789 11',
          fornavnAvsender: 'Legacy',
          etternavnAvsender: 'Sender',
        },
      }),
    ).toEqual({
      onBehalfOf: 'other-person',
      sender: { firstName: 'Legacy', surname: 'Sender' },
      user: { kind: 'identified-person', nationalIdentityNumber: '123 456 789 11' },
    });
  });
});
