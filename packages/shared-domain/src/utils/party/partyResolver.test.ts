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
      relationship: 'self',
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
      relationship: 'self',
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
      relationship: 'other-person',
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
      relationship: 'organization',
      sender: { name: 'Organization', organizationNumber: '889 640 782' },
      user: {
        kind: 'unidentified-person',
        firstName: 'User',
        surname: 'Usersen',
        address: { postalCode: '0101' },
      },
    });
  });

  const incompletePartyData: Submission['data'][] = [
    {},
    { yourInformation: {} },
    { yourInformation: { fornavn: 'Name', etternavn: 'Only' } },
    {
      yourInformation: { identitet: { identitetsnummer: '12345678911' } },
      sender: {
        person: {
          firstName: 'Sender',
          surname: 'Sendersen',
          nationalIdentityNumber: '',
        },
      },
    },
    {
      yourInformation: { identitet: { identitetsnummer: '12345678911' } },
      sender: {
        organization: {
          name: 'Organization',
          number: '',
        },
      },
    },
  ];

  it.each(incompletePartyData)('returns undefined for incomplete party data', (data) => {
    expect(resolve(data)).toBeUndefined();
  });
});
