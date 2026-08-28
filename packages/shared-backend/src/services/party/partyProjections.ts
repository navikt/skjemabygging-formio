import {
  CoverPageDownloadType,
  PartyAddress,
  PartyData,
  ResponseError,
  partyUtils,
  validatorUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { AvsenderId } from '../application';

interface SubmissionPartyProjection {
  bruker?: string;
  avsender?: AvsenderId;
}

interface CoverPagePartyProjection {
  user?: CoverPageDownloadType['user'];
  recipient?: Extract<CoverPageDownloadType['recipient'], { navUnit: string }>;
}

const toSender = (party: PartyData): AvsenderId => {
  const { responsibleSender } = partyUtils.resolvePartyRoles(party);
  if (responsibleSender.type === 'organization') {
    return {
      idType: 'ORGNR',
      id: responsibleSender.organizationNumber,
      navn: responsibleSender.name,
    };
  }
  const name = [responsibleSender.firstName, responsibleSender.surname].filter(Boolean).join(' ') || undefined;
  return {
    ...(responsibleSender.nationalIdentityNumber && {
      idType: 'FNR' as const,
      id: responsibleSender.nationalIdentityNumber,
    }),
    ...(name && { navn: name }),
  };
};

const toSubmissionParties = (party: PartyData): SubmissionPartyProjection => {
  const { relationship, concernedUser } = partyUtils.resolvePartyRoles(party);
  return {
    ...(concernedUser.type === 'identified' && { bruker: concernedUser.nationalIdentityNumber }),
    ...(relationship !== 'self' && { avsender: toSender(party) }),
  };
};

const assertValidCoverPageValue = (value?: string) => {
  if (value && !validatorUtils.isValidCoverPageValue(value)) {
    throw new ResponseError('BAD_REQUEST', 'Invalid party value for cover page');
  }
};

const toCoverPageAddress = (address: PartyAddress) => {
  const common = { co: address.co };
  if (address.type === 'norwegianStreet') {
    return {
      ...common,
      streetAddress: address.street,
      postalCode: address.postalCode,
      postalName: address.postalName,
    };
  }
  if (address.type === 'norwegianPostOfficeBox') {
    return {
      ...common,
      postOfficeBox: address.postOfficeBox,
      postalCode: address.postalCode,
      postalName: address.postalName,
    };
  }
  return {
    ...common,
    streetAddress: address.street,
    building: address.building,
    postalCode: address.postalCode,
    postalName: address.location,
    region: address.region,
    country: {
      value: address.country.code ?? address.country.name,
      label: address.country.name,
    },
  };
};

const validateCoverPageUser = (user: CoverPageDownloadType['user']) => {
  if ('nationalIdentityNumber' in user) {
    assertValidCoverPageValue(user.nationalIdentityNumber);
    return;
  }
  if ('organizationNumber' in user) {
    assertValidCoverPageValue(user.organizationNumber);
    return;
  }
  assertValidCoverPageValue(user.firstName);
  assertValidCoverPageValue(user.surname);
  Object.values(user.address).forEach((value) => {
    if (typeof value === 'string') {
      assertValidCoverPageValue(value);
    } else {
      assertValidCoverPageValue(value?.value);
      assertValidCoverPageValue(value?.label);
    }
  });
};

const toCoverPageParties = (party: PartyData): CoverPagePartyProjection => {
  const { concernedUser, navUnit } = partyUtils.resolvePartyRoles(party);
  if (concernedUser.type === 'severalPeople') {
    return { recipient: { navUnit: navUnit!.number } };
  }

  const user: CoverPageDownloadType['user'] =
    concernedUser.type === 'identified'
      ? { nationalIdentityNumber: concernedUser.nationalIdentityNumber }
      : {
          firstName: concernedUser.firstName,
          surname: concernedUser.surname,
          address: toCoverPageAddress(concernedUser.address),
        };
  validateCoverPageUser(user);
  return { user };
};

const partyProjections = {
  toCoverPageParties,
  toSubmissionParties,
};

export { partyProjections };
export type { CoverPagePartyProjection, SubmissionPartyProjection };
