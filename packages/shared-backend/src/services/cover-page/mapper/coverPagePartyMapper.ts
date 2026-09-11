import { CoverPageDownloadType, Party } from '@navikt/skjemadigitalisering-shared-domain';

type CoverPagePartyData =
  | {
      user: CoverPageDownloadType['user'];
    }
  | {
      user?: never;
    };

const mapPartyToCoverPage = (party: Party): CoverPagePartyData => {
  if (party.onBehalfOf === 'multiple-people') {
    return {};
  }

  if (party.user.kind === 'identified-person') {
    return {
      user: {
        nationalIdentityNumber: party.user.nationalIdentityNumber,
      },
    };
  }

  return {
    user: {
      firstName: party.user.firstName,
      surname: party.user.surname,
      address: party.user.address,
    },
  };
};

export { mapPartyToCoverPage };
export type { CoverPagePartyData };
