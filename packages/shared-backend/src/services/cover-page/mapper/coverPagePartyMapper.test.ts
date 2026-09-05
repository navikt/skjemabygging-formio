import { Party } from '@navikt/skjemadigitalisering-shared-domain';
import { mapPartyToCoverPage } from './coverPagePartyMapper';

describe('mapPartyToCoverPage', () => {
  it('maps an identified concerned user', () => {
    const party: Party = {
      relationship: 'organization',
      sender: { name: 'Organization', organizationNumber: '889640782' },
      user: { kind: 'identified-person', nationalIdentityNumber: '12345678911' },
    };

    expect(mapPartyToCoverPage(party)).toEqual({
      user: { nationalIdentityNumber: '12345678911' },
    });
  });

  it('maps an unidentified concerned user without changing name or address', () => {
    const address = {
      streetAddress: 'Testveien 1',
      postalCode: '0101',
      postalName: 'Oslo',
      country: { value: 'NO', label: 'Norge' },
    };
    const party: Party = {
      relationship: 'other-person',
      sender: { firstName: 'Sender', surname: 'Sendersen', nationalIdentityNumber: '10987654321' },
      user: {
        kind: 'unidentified-person',
        firstName: 'User',
        surname: 'Usersen',
        address,
      },
    };

    expect(mapPartyToCoverPage(party)).toEqual({
      user: {
        firstName: 'User',
        surname: 'Usersen',
        address,
      },
    });
  });

  it('maps several people to NAV-unit routing without a cover-page user', () => {
    const party: Party = {
      relationship: 'organization',
      sender: { name: 'Organization', organizationNumber: '889640782' },
      user: { kind: 'several-people', navUnit: '9999' },
    };

    expect(mapPartyToCoverPage(party)).toEqual({
      recipient: { navUnit: '9999' },
    });
  });
});
