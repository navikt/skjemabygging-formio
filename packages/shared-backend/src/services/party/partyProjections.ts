import { Address, CoverPageDownloadType, Party, Sender } from '@navikt/skjemadigitalisering-shared-domain';
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

/** Renames the submitted address to the cover-page field names. Every field stays optional. */
const toCoverPageAddress = (address: Address) => ({
  co: address.co,
  streetAddress: address.adresse,
  postOfficeBox: address.postboks,
  building: address.bygning,
  postalCode: address.postnummer,
  postalName: address.bySted,
  region: address.region,
  country: address.land,
});

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
