import { Component, Form, Submission } from '../../models';
import { resolveParty } from './partyResolver';

const form = {
  components: [
    { type: 'container', key: 'yourInformation', yourInformation: true, input: true },
    { type: 'sender', key: 'sender', input: true },
  ] as Component[],
} as Form;

const resolve = (data: Submission['data']) => resolveParty(form, { data });

const legacyFlatUserComponents: Component[] = [
  { type: 'fnrfield', key: 'fodselsnummerDNummerSoker', label: 'Identity number' },
  { type: 'firstName', key: 'fornavnSoker', label: 'First name' },
  { type: 'surname', key: 'etternavnSoker', label: 'Surname' },
  { type: 'textfield', key: 'gateadresseSoker', label: 'Street address' },
  { type: 'textfield', key: 'postnrSoker', label: 'Postal code' },
  { type: 'textfield', key: 'poststedSoker', label: 'Postal name' },
];

const mixedLegacyForm = {
  components: [...legacyFlatUserComponents, { type: 'sender', key: 'sender', input: true }],
} as Form;

const resolveMixedLegacy = (data: Submission['data']) => resolveParty(mixedLegacyForm, { data });

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
      sender: { name: 'Organization', organizationNumber: '889 640 782' },
      user: {
        kind: 'unidentified-person',
        firstName: 'User',
        surname: 'Usersen',
        address: { postalCode: '0101' },
      },
    });
  });

  it('resolves an organization acting for multiple people without requiring a NAV unit', () => {
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
      onBehalfOf: 'multiple-people',
      sender: { name: 'Organization', organizationNumber: '889 640 782' },
      user: { kind: 'multiple-people' },
    });
  });

  it('returns undefined when no user or sender is submitted', () => {
    expect(resolve({})).toBeUndefined();
  });

  describe('flat legacy user fields in forms with Sender', () => {
    it('resolves an identified person acting on their own behalf', () => {
      expect(resolveMixedLegacy({ fodselsnummerDNummerSoker: '123 456 789 11' })).toEqual({
        onBehalfOf: 'self',
        user: { kind: 'identified-person', nationalIdentityNumber: '123 456 789 11' },
      });
    });

    it('resolves a person Sender acting for an unidentified user', () => {
      expect(
        resolveMixedLegacy({
          fornavnSoker: 'Legacy',
          etternavnSoker: 'User',
          gateadresseSoker: 'Testveien 1',
          postnrSoker: '0101',
          poststedSoker: 'Oslo',
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
        user: {
          kind: 'unidentified-person',
          firstName: 'Legacy',
          surname: 'User',
          address: {
            streetAddress: 'Testveien 1',
            postalCode: '0101',
            postalName: 'Oslo',
            country: { value: '', label: '' },
          },
        },
      });
    });

    it('resolves the nav020807 organization case as other-person', () => {
      expect(
        resolveMixedLegacy({
          fodselsnummerDNummerSoker: '123 456 789 11',
          sender: {
            organization: {
              name: 'Organization',
              number: '889 640 782',
            },
          },
        }),
      ).toEqual({
        onBehalfOf: 'other-person',
        sender: { name: 'Organization', organizationNumber: '889 640 782' },
        user: { kind: 'identified-person', nationalIdentityNumber: '123 456 789 11' },
      });
    });

    it('preserves the legacy fallback for an unidentified person acting on their own behalf', () => {
      expect(
        resolveMixedLegacy({
          fornavnSoker: 'Legacy',
          etternavnSoker: 'User',
          gateadresseSoker: 'Testveien 1',
          postnrSoker: '0101',
          poststedSoker: 'Oslo',
        }),
      ).toBeUndefined();
    });

    it('returns undefined for incomplete flat user data rather than resolving multiple people', () => {
      expect(
        resolveMixedLegacy({
          fornavnSoker: 'Incomplete',
          sender: {
            organization: {
              name: 'Organization',
              number: '889 640 782',
            },
          },
        }),
      ).toBeUndefined();
    });

    it('prefers canonical user data when both layouts have submitted values', () => {
      const mixedCanonicalForm = {
        components: [
          { type: 'container', key: 'yourInformation', yourInformation: true, input: true },
          ...mixedLegacyForm.components,
        ],
      } as Form;

      expect(
        resolveParty(mixedCanonicalForm, {
          data: {
            yourInformation: {
              identitet: { identitetsnummer: '111 111 111 11' },
            },
            fodselsnummerDNummerSoker: '222 222 222 22',
          },
        }),
      ).toEqual({
        onBehalfOf: 'self',
        user: { kind: 'identified-person', nationalIdentityNumber: '111 111 111 11' },
      });
    });
  });

  it('leaves forms with flat user components but no Sender component to legacy mapping', () => {
    const legacyForm = {
      components: [
        { type: 'container', key: 'yourInformation', yourInformation: true, input: true },
        ...legacyFlatUserComponents,
      ],
    } as Form;

    expect(
      resolveParty(legacyForm, {
        data: {
          yourInformation: {
            identitet: { identitetsnummer: '111 111 111 11' },
          },
          fodselsnummerDNummerSoker: '222 222 222 22',
        },
      }),
    ).toBeUndefined();
  });
});
