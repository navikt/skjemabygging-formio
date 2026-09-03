import { CoverPageDownloadType, Party } from '@navikt/skjemadigitalisering-shared-domain';

type CoverPagePartyData = Pick<CoverPageDownloadType, 'user' | 'recipient'>;

const mapPartyToCoverPage = (party: Party): CoverPagePartyData => {
  if (party.user.kind === 'identified-person') {
    return {
      user: {
        nationalIdentityNumber: party.user.nationalIdentityNumber,
      },
    };
  }

  if (party.user.kind === 'unidentified-person') {
    return {
      user: {
        firstName: party.user.firstName,
        surname: party.user.surname,
        address: party.user.address,
      },
    };
  }

  return {
    recipient: {
      navUnit: party.user.navUnit,
    },
  };
};

export { mapPartyToCoverPage };
export type { CoverPagePartyData };
