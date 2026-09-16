import { CoverPageDownloadType, formatUtils, Party, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';

type CoverPagePartyData = {
  user?: CoverPageDownloadType['user'];
  navUnit?: string;
};

const mapPartyToCoverPage = (party: Party): CoverPagePartyData => {
  if (party.onBehalfOf === 'multiple-people') {
    return { navUnit: party.navUnit };
  }

  if ('number' in party.user) {
    return {
      user: {
        organizationNumber: formatUtils.removeAllSpaces(party.user.number),
      },
    };
  }

  if (party.user.kind === 'identified-person') {
    return {
      user: {
        nationalIdentityNumber: party.user.nationalIdentityNumber,
      },
    };
  }

  if (!party.user.address && (party.user.firstName || party.user.surname)) {
    throw new ResponseError('BAD_REQUEST', 'User needs to submit either identification number or address');
  }

  return {
    user: {
      firstName: party.user.firstName ?? '',
      surname: party.user.surname ?? '',
      address: party.user.address ?? {},
    },
  };
};

export { mapPartyToCoverPage };
export type { CoverPagePartyData };
