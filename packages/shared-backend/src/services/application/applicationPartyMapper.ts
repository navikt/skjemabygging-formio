import {
  ConcernedPerson,
  formatUtils,
  isSenderOrganization,
  isSenderPerson,
  Party,
  PartySender,
} from '@navikt/skjemadigitalisering-shared-domain';
import { AvsenderId, SubmitApplicationRequest } from './applicationTypes';

type ApplicationPartyData = Pick<SubmitApplicationRequest, 'bruker' | 'avsender'>;

const mapSender = (sender: PartySender): AvsenderId => {
  if (isSenderOrganization(sender)) {
    return {
      id: formatUtils.removeAllSpaces(sender.number),
      idType: 'ORGNR',
      navn: sender.name,
    };
  }

  if (isSenderPerson(sender)) {
    return {
      id: formatUtils.removeAllSpaces(sender.nationalIdentityNumber),
      idType: 'FNR',
      navn: `${sender.firstName} ${sender.surname}`,
    };
  }

  return { navn: `${sender.firstName} ${sender.surname}` };
};

const mapOrganizationSender = (party: Extract<Party, { onBehalfOf: 'multiple-people' }>): AvsenderId => ({
  id: formatUtils.removeAllSpaces(party.sender.number),
  idType: 'ORGNR',
  navn: party.sender.name,
});

const mapUser = (user: ConcernedPerson): Pick<ApplicationPartyData, 'bruker'> =>
  user.kind === 'identified-person' ? { bruker: formatUtils.removeAllSpaces(user.nationalIdentityNumber) } : {};

const mapPartyToApplication = (party: Party): ApplicationPartyData => {
  if (party.onBehalfOf === 'self') {
    if (isSenderOrganization(party.user)) {
      return {
        avsender: {
          id: formatUtils.removeAllSpaces(party.user.number),
          idType: 'ORGNR',
          navn: party.user.name,
        },
      };
    }

    if (party.user.kind === 'identified-person') {
      return mapUser(party.user);
    }

    return party.user.firstName && party.user.surname
      ? {
          avsender: {
            navn: `${party.user.firstName} ${party.user.surname}`,
          },
        }
      : {};
  }

  if (party.onBehalfOf === 'other-person') {
    return {
      ...mapUser(party.user),
      avsender: mapSender(party.sender),
    };
  }

  return {
    avsender: mapOrganizationSender(party),
  };
};

export { mapPartyToApplication };
export type { ApplicationPartyData };
