import { Submission } from '../../models';
import { PartyResolutionErrorCode, PartyRuntimeContext, PartyValueLookup, resolveParty } from './partyResolver';

const dataAt =
  <T>(key: string) =>
  (submission: Submission) =>
    submission.data[key] as T | undefined;

const lookup: PartyValueLookup = {
  relationship: dataAt('relationship'),
  user: dataAt('user'),
  sender: dataAt('sender'),
  organization: dataAt('organization'),
  navUnit: dataAt('navUnit'),
};

const resolve = (data: Submission['data']) => resolveParty({ data }, lookup);

describe('resolveParty', () => {
  it('resolves an identified person acting on their own behalf', () => {
    expect(
      resolve({
        relationship: 'self',
        user: { nationalIdentityNumber: '123 456 789 11' },
      }),
    ).toEqual({
      success: true,
      party: {
        relationship: 'self',
        user: { kind: 'identified-person', nationalIdentityNumber: '12345678911' },
      },
    });
  });

  it('resolves an unidentified person acting on their own behalf', () => {
    const address = { streetAddress: 'Testveien 1', postalCode: '0101', postalName: 'Oslo' };

    expect(
      resolve({
        relationship: 'self',
        user: { firstName: 'Test', surname: 'Testesen', address },
      }),
    ).toEqual({
      success: true,
      party: {
        relationship: 'self',
        user: { kind: 'unidentified-person', firstName: 'Test', surname: 'Testesen', address },
      },
    });
  });

  it('resolves a person acting for an identified person', () => {
    expect(
      resolve({
        relationship: 'other-person',
        sender: {
          firstName: 'Sender',
          surname: 'Sendersen',
          nationalIdentityNumber: '109 876 543 21',
        },
        user: { nationalIdentityNumber: '123 456 789 11' },
      }),
    ).toEqual({
      success: true,
      party: {
        relationship: 'other-person',
        sender: {
          firstName: 'Sender',
          surname: 'Sendersen',
          nationalIdentityNumber: '10987654321',
        },
        user: { kind: 'identified-person', nationalIdentityNumber: '12345678911' },
      },
    });
  });

  it('resolves a person acting for an unidentified person', () => {
    const address = { country: { value: 'SE', label: 'Sverige' } };

    expect(
      resolve({
        relationship: 'other-person',
        sender: {
          firstName: 'Sender',
          surname: 'Sendersen',
          nationalIdentityNumber: '10987654321',
        },
        user: { firstName: 'User', surname: 'Usersen', address },
      }),
    ).toEqual({
      success: true,
      party: {
        relationship: 'other-person',
        sender: {
          firstName: 'Sender',
          surname: 'Sendersen',
          nationalIdentityNumber: '10987654321',
        },
        user: { kind: 'unidentified-person', firstName: 'User', surname: 'Usersen', address },
      },
    });
  });

  it.each([
    {
      name: 'identified person',
      user: { nationalIdentityNumber: '12345678911' },
      expectedUser: { kind: 'identified-person', nationalIdentityNumber: '12345678911' },
    },
    {
      name: 'unidentified person',
      user: { firstName: 'User', surname: 'Usersen', address: { postalCode: '0101' } },
      expectedUser: {
        kind: 'unidentified-person',
        firstName: 'User',
        surname: 'Usersen',
        address: { postalCode: '0101' },
      },
    },
  ])('resolves an organization acting for an $name', ({ user, expectedUser }) => {
    expect(
      resolve({
        relationship: 'organization',
        organization: { name: 'Organization', organizationNumber: '889 640 782' },
        user,
      }),
    ).toEqual({
      success: true,
      party: {
        relationship: 'organization',
        sender: { name: 'Organization', organizationNumber: '889640782' },
        user: expectedUser,
      },
    });
  });

  it('resolves an organization acting for several people with an allowed NAV unit', () => {
    const submission = {
      data: {
        relationship: 'organization',
        organization: { name: 'Organization', organizationNumber: '889640782' },
        user: { kind: 'several-people' },
        navUnit: '9999',
      },
    };

    expect(resolveParty(submission, lookup, { allowedNavUnits: ['9999'] })).toEqual({
      success: true,
      party: {
        relationship: 'organization',
        sender: { name: 'Organization', organizationNumber: '889640782' },
        user: { kind: 'several-people', navUnit: '9999' },
      },
    });
  });

  it('uses verified actor identity without replacing the concerned user', () => {
    const submission = {
      data: {
        relationship: 'other-person',
        sender: { firstName: 'Sender', surname: 'Sendersen', nationalIdentityNumber: 'self reported' },
        user: { nationalIdentityNumber: '12345678911' },
      },
    };

    expect(resolveParty(submission, lookup, { verifiedActor: { nationalIdentityNumber: '109 876 543 21' } })).toEqual({
      success: true,
      party: {
        relationship: 'other-person',
        sender: {
          firstName: 'Sender',
          surname: 'Sendersen',
          nationalIdentityNumber: '10987654321',
        },
        user: { kind: 'identified-person', nationalIdentityNumber: '12345678911' },
      },
    });
  });

  it('does not replace a self-reported concerned user with verified actor identity', () => {
    const address = { country: { value: 'SE', label: 'Sverige' } };
    const submission = {
      data: {
        relationship: 'self',
        user: { firstName: 'User', surname: 'Usersen', address },
      },
    };

    expect(resolveParty(submission, lookup, { verifiedActor: { nationalIdentityNumber: '10987654321' } })).toEqual({
      success: true,
      party: {
        relationship: 'self',
        user: { kind: 'unidentified-person', firstName: 'User', surname: 'Usersen', address },
      },
    });
  });

  const invalidCases: {
    name: string;
    data: Submission['data'];
    context?: PartyRuntimeContext;
    error: PartyResolutionErrorCode;
  }[] = [
    {
      name: 'a missing relationship',
      data: { user: { nationalIdentityNumber: '12345678911' } },
      error: 'missing-relationship',
    },
    {
      name: 'an invalid relationship',
      data: { relationship: 'invalid', user: { nationalIdentityNumber: '12345678911' } },
      error: 'invalid-relationship',
    },
    {
      name: 'a missing user',
      data: { relationship: 'self' },
      error: 'missing-user',
    },
    {
      name: 'a user without a name or identity number',
      data: { relationship: 'self', user: {} },
      error: 'missing-user-name',
    },
    {
      name: 'a name-only user',
      data: { relationship: 'self', user: { firstName: 'Name', surname: 'Only' } },
      error: 'missing-user-address',
    },
    {
      name: 'several people without an organization',
      data: { relationship: 'self', user: { kind: 'several-people' } },
      error: 'unsupported-user',
    },
    {
      name: 'a NAV unit outside the allowed context',
      data: {
        relationship: 'organization',
        organization: { name: 'Organization', organizationNumber: '889640782' },
        user: { kind: 'several-people' },
        navUnit: '9999',
      },
      context: { allowedNavUnits: ['0001'] },
      error: 'nav-unit-not-allowed',
    },
    {
      name: 'a NAV unit without allowed NAV-unit context',
      data: {
        relationship: 'organization',
        organization: { name: 'Organization', organizationNumber: '889640782' },
        user: { kind: 'several-people' },
        navUnit: '9999',
      },
      error: 'missing-allowed-nav-units',
    },
    {
      name: 'a missing person sender',
      data: { relationship: 'other-person', user: { nationalIdentityNumber: '12345678911' } },
      error: 'missing-sender',
    },
    {
      name: 'a person sender without a name',
      data: {
        relationship: 'other-person',
        sender: { nationalIdentityNumber: '10987654321' },
        user: { nationalIdentityNumber: '12345678911' },
      },
      error: 'missing-sender-name',
    },
    {
      name: 'a whitespace-only sender identity',
      data: {
        relationship: 'other-person',
        sender: { firstName: 'Sender', surname: 'Sendersen', nationalIdentityNumber: '   ' },
        user: { nationalIdentityNumber: '12345678911' },
      },
      error: 'missing-sender-identity',
    },
    {
      name: 'a missing organization sender',
      data: { relationship: 'organization', user: { nationalIdentityNumber: '12345678911' } },
      error: 'missing-organization',
    },
    {
      name: 'an organization sender without a name',
      data: {
        relationship: 'organization',
        organization: { organizationNumber: '889640782' },
        user: { nationalIdentityNumber: '12345678911' },
      },
      error: 'missing-organization-name',
    },
    {
      name: 'a whitespace-only organization number',
      data: {
        relationship: 'organization',
        organization: { name: 'Organization', organizationNumber: '   ' },
        user: { nationalIdentityNumber: '12345678911' },
      },
      error: 'missing-organization-number',
    },
    {
      name: 'several people without a NAV unit',
      data: {
        relationship: 'organization',
        organization: { name: 'Organization', organizationNumber: '889640782' },
        user: { kind: 'several-people' },
      },
      context: { allowedNavUnits: ['9999'] },
      error: 'missing-nav-unit',
    },
    {
      name: 'several people missing both a NAV unit and an organization',
      data: {
        relationship: 'organization',
        user: { kind: 'several-people' },
      },
      context: { allowedNavUnits: ['9999'] },
      error: 'missing-nav-unit',
    },
    {
      name: 'an address object without any populated value',
      data: { relationship: 'self', user: { firstName: 'Name', surname: 'Only', address: {} } },
      error: 'missing-user-address',
    },
    {
      name: 'an address carrying only empty values',
      data: {
        relationship: 'self',
        user: { firstName: 'Name', surname: 'Only', address: { streetAddress: '', country: { value: '', label: '' } } },
      },
      error: 'missing-user-address',
    },
    {
      name: 'an address whose nested value is not a country object',
      data: {
        relationship: 'self',
        user: { firstName: 'Name', surname: 'Only', address: { unexpected: {} } },
      },
      error: 'missing-user-address',
    },
  ];

  it.each(invalidCases)('rejects $name without a compatibility fallback', ({ data, context, error }) => {
    expect(resolveParty({ data }, lookup, context)).toEqual({ success: false, error });
  });
});
