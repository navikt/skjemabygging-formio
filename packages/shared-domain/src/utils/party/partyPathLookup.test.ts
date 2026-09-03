import { createPartyPathLookup } from './partyPathLookup';
import { resolveParty } from './partyResolver';

describe('createPartyPathLookup', () => {
  it('resolves ettersending values without a form definition', () => {
    const submission = {
      data: {
        party: {
          relationship: 'other-person',
          user: { nationalIdentityNumber: '12345678911' },
          sender: {
            firstName: 'Sender',
            surname: 'Sendersen',
            nationalIdentityNumber: '10987654321',
          },
        },
      },
    };
    const lookup = createPartyPathLookup({
      relationship: 'party.relationship',
      user: 'party.user',
      sender: 'party.sender',
    });

    expect(resolveParty(submission, lookup)).toEqual({
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

  it('resolves lospost values from journey-owned paths', () => {
    const submission = {
      data: {
        senderAndUser: {
          relationship: 'organization',
          user: { kind: 'several-people' },
          organization: { name: 'Organization', organizationNumber: '889640782' },
        },
        routing: {
          navUnit: '9999',
        },
      },
    };
    const lookup = createPartyPathLookup({
      relationship: 'senderAndUser.relationship',
      user: 'senderAndUser.user',
      organization: 'senderAndUser.organization',
      navUnit: 'routing.navUnit',
    });

    expect(resolveParty(submission, lookup, { allowedNavUnits: ['9999'] })).toEqual({
      success: true,
      party: {
        relationship: 'organization',
        sender: { name: 'Organization', organizationNumber: '889640782' },
        user: { kind: 'several-people', navUnit: '9999' },
      },
    });
  });
});
