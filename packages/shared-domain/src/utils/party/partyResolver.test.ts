import { Submission } from '../../models';
import { PartyRuntimeContext, PartyValueLookup, resolveParty } from './partyResolver';

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

const resolve = (data: Submission['data'], context?: PartyRuntimeContext) => resolveParty({ data }, lookup, context);

describe('resolveParty', () => {
  it('returns undefined when no party relationship is configured', () => {
    expect(resolve({})).toBeUndefined();
  });

  it('resolves an identified person acting on their own behalf without changing input values', () => {
    expect(
      resolve({
        relationship: 'self',
        user: { nationalIdentityNumber: '123 456 789 11' },
      }),
    ).toEqual({
      relationship: 'self',
      user: { kind: 'identified-person', nationalIdentityNumber: '123 456 789 11' },
    });
  });

  it('trusts an address produced by the your-information component', () => {
    const address = { country: { value: 'SE', label: 'Sverige' } };

    expect(
      resolve({
        relationship: 'self',
        user: { firstName: 'Test', surname: 'Testesen', address },
      }),
    ).toEqual({
      relationship: 'self',
      user: { kind: 'unidentified-person', firstName: 'Test', surname: 'Testesen', address },
    });
  });

  it('resolves a person acting for another identified person', () => {
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
      relationship: 'other-person',
      sender: {
        firstName: 'Sender',
        surname: 'Sendersen',
        nationalIdentityNumber: '109 876 543 21',
      },
      user: { kind: 'identified-person', nationalIdentityNumber: '123 456 789 11' },
    });
  });

  it('uses verified actor identity without replacing the concerned user', () => {
    expect(
      resolve(
        {
          relationship: 'other-person',
          sender: { firstName: 'Sender', surname: 'Sendersen', nationalIdentityNumber: 'self reported' },
          user: { nationalIdentityNumber: '12345678911' },
        },
        { verifiedActor: { nationalIdentityNumber: '10987654321' } },
      ),
    ).toEqual({
      relationship: 'other-person',
      sender: {
        firstName: 'Sender',
        surname: 'Sendersen',
        nationalIdentityNumber: '10987654321',
      },
      user: { kind: 'identified-person', nationalIdentityNumber: '12345678911' },
    });
  });

  it('resolves an organization acting for an unidentified person', () => {
    const address = { postalCode: '0101' };

    expect(
      resolve({
        relationship: 'organization',
        organization: { name: 'Organization', organizationNumber: '889 640 782' },
        user: { firstName: 'User', surname: 'Usersen', address },
      }),
    ).toEqual({
      relationship: 'organization',
      sender: { name: 'Organization', organizationNumber: '889 640 782' },
      user: { kind: 'unidentified-person', firstName: 'User', surname: 'Usersen', address },
    });
  });

  it('resolves an organization acting for several people with an allowed NAV unit', () => {
    expect(
      resolve(
        {
          relationship: 'organization',
          organization: { name: 'Organization', organizationNumber: '889640782' },
          user: { kind: 'several-people' },
          navUnit: '9999',
        },
        { allowedNavUnits: ['9999'] },
      ),
    ).toEqual({
      relationship: 'organization',
      sender: { name: 'Organization', organizationNumber: '889640782' },
      user: { kind: 'several-people', navUnit: '9999' },
    });
  });

  const incompletePartyData: Submission['data'][] = [
    { relationship: 'self' },
    { relationship: 'self', user: {} },
    { relationship: 'self', user: { firstName: 'Name', surname: 'Only' } },
    { relationship: 'other-person', user: { nationalIdentityNumber: '12345678911' } },
    {
      relationship: 'other-person',
      sender: { firstName: 'Sender', surname: 'Sendersen' },
      user: { nationalIdentityNumber: '12345678911' },
    },
    { relationship: 'organization', user: { nationalIdentityNumber: '12345678911' } },
    {
      relationship: 'organization',
      organization: { name: 'Organization' },
      user: { nationalIdentityNumber: '12345678911' },
    },
    {
      relationship: 'organization',
      organization: { name: 'Organization', organizationNumber: '889640782' },
      user: { kind: 'several-people' },
    },
  ];

  it.each(incompletePartyData)('returns undefined for incomplete party data', (data) => {
    expect(resolve(data)).toBeUndefined();
  });
});
