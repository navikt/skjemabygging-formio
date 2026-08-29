import { CoverPageDownloadType, Party, PartyAddress, Sender } from '@navikt/skjemadigitalisering-shared-domain';
import { AvsenderId } from '../application';

interface SubmissionPartyProjection {
  readonly bruker?: string;
  readonly avsender?: AvsenderId;
}

type CoverPageUser = NonNullable<CoverPageDownloadType['user']>;

interface CoverPagePartyProjection {
  readonly user?: CoverPageUser;
  readonly recipient?: Extract<CoverPageDownloadType['recipient'], { navUnit: string }>;
}

const toSenderId = (sender: Sender): AvsenderId => {
  const navn = sender.name && `${sender.name.firstName} ${sender.name.surname}`;
  return {
    ...(sender.type === 'identified' && { idType: 'FNR' as const, id: sender.nationalIdentityNumber }),
    ...(navn && { navn }),
  };
};

const toAvsender = (party: Party): AvsenderId | undefined => {
  switch (party.on) {
    case 'ownBehalf':
      return undefined;
    case 'behalfOfOther':
      return toSenderId(party.sender);
    case 'behalfOfOrg':
      return {
        idType: 'ORGNR',
        id: party.organization.organizationNumber,
        navn: party.organization.name,
      };
  }
};

const getUser = (party: Party) => (party.on === 'ownBehalf' ? party.person : party.user);

const toSubmissionParties = (party: Party): SubmissionPartyProjection => {
  const user = getUser(party);
  const avsender = toAvsender(party);
  return {
    ...(user.type === 'identified' && { bruker: user.nationalIdentityNumber }),
    ...(avsender && { avsender }),
  };
};

const toCoverPageAddress = (address: PartyAddress) => {
  const common = { co: address.co };
  switch (address.type) {
    case 'NORWEGIAN_ADDRESS':
      return {
        ...common,
        streetAddress: address.street,
        postalCode: address.postalCode,
        postalName: address.postalName,
      };
    case 'POST_OFFICE_BOX':
      return {
        ...common,
        postOfficeBox: address.postOfficeBox,
        postalCode: address.postalCode,
        postalName: address.postalName,
      };
    case 'FOREIGN_ADDRESS':
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
  }
};

const toCoverPageParties = (party: Party): CoverPagePartyProjection => {
  const user = getUser(party);
  if (user.type === 'severalPeople') {
    return { recipient: { navUnit: user.navUnit.number } };
  }
  if (user.type === 'identified') {
    return { user: { nationalIdentityNumber: user.nationalIdentityNumber } };
  }
  return {
    user: {
      firstName: user.name.firstName,
      surname: user.name.surname,
      address: toCoverPageAddress(user.address),
    },
  };
};

const partyProjections = {
  toCoverPageParties,
  toSubmissionParties,
};

export { partyProjections };
export type { CoverPagePartyProjection, SubmissionPartyProjection };
