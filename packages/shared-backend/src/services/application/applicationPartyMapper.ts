import {
  ConcernedPerson,
  formatUtils,
  isSenderOrganization,
  isSenderPerson,
  Party,
  PartySender,
  SenderOrganization,
} from '@navikt/skjemadigitalisering-shared-domain';
import { AvsenderId, SubmitApplicationRequest } from './applicationTypes';

type ApplicationPartyData = Pick<SubmitApplicationRequest, 'bruker' | 'avsender'>;

const getFullName = (firstName: string, surname: string): string => `${firstName} ${surname}`;

const mapOrganization = (organization: SenderOrganization): AvsenderId => ({
  id: formatUtils.removeAllSpaces(organization.number),
  idType: 'ORGNR',
  navn: organization.name,
});

const mapSender = (sender: PartySender): AvsenderId => {
  if (isSenderOrganization(sender)) {
    return mapOrganization(sender);
  }

  const mappedSender = { navn: getFullName(sender.firstName, sender.surname) };

  if (isSenderPerson(sender)) {
    return {
      ...mappedSender,
      id: formatUtils.removeAllSpaces(sender.nationalIdentityNumber),
      idType: 'FNR',
    };
  }

  return mappedSender;
};

const mapUser = (user: ConcernedPerson): Pick<ApplicationPartyData, 'bruker'> | undefined =>
  user.kind === 'identified-person' ? { bruker: formatUtils.removeAllSpaces(user.nationalIdentityNumber) } : undefined;

const mapPartyToApplication = (party: Party): ApplicationPartyData | undefined => {
  if (party.onBehalfOf === 'self') {
    if ('sender' in party) {
      return {
        avsender: mapSender(party.sender),
      };
    }

    if (party.user.kind === 'identified-person') {
      return mapUser(party.user);
    }

    return party.user.firstName && party.user.surname
      ? {
          avsender: {
            navn: getFullName(party.user.firstName, party.user.surname),
          },
        }
      : undefined;
  }

  if (party.onBehalfOf === 'other-person') {
    return {
      ...(mapUser(party.user) ?? {}),
      avsender: mapSender(party.sender),
    };
  }

  return {
    avsender: mapOrganization(party.sender),
  };
};

export { mapPartyToApplication };
export type { ApplicationPartyData };
