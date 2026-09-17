import { Party } from '@navikt/skjemadigitalisering-shared-domain';
import { mapPartyToCoverPage } from './coverPagePartyMapper';

describe('mapPartyToCoverPage', () => {
  it('maps an identified concerned user', () => {
    const party: Party = {
      onBehalfOf: 'other-person',
      sender: { name: 'Organization', number: '889640782' },
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
      onBehalfOf: 'other-person',
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

  it('rejects an unidentified user without an address', () => {
    const party: Party = {
      onBehalfOf: 'other-person',
      sender: { name: 'Organization', number: '889640782' },
      user: { kind: 'unidentified-person' },
    };

    expect(() => mapPartyToCoverPage(party)).toThrow(
      'User needs to submit either identification number or address',
    );
  });

  it('maps an organization acting on its own behalf', () => {
    const party: Party = {
      onBehalfOf: 'self',
      user: { name: 'Organization', number: '889 640 782' },
    };

    expect(mapPartyToCoverPage(party)).toEqual({
      user: { organizationNumber: '889640782' },
    });
  });

  it('maps multiple people to their NAV unit', () => {
    const party: Party = {
      onBehalfOf: 'multiple-people',
      sender: { name: 'Organization', number: '889640782' },
      navUnit: '9999',
    };

    expect(mapPartyToCoverPage(party)).toEqual({ navUnit: '9999' });
  });
});
