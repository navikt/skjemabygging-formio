import { Party } from '@navikt/skjemadigitalisering-shared-domain';
import { AvsenderId, SubmitApplicationRequest } from './applicationTypes';

type ApplicationPartyData = Pick<SubmitApplicationRequest, 'bruker' | 'avsender'>;

const mapPersonSender = (party: Extract<Party, { relationship: 'other-person' }>): AvsenderId => ({
  id: party.sender.nationalIdentityNumber,
  idType: 'FNR',
  navn: `${party.sender.firstName} ${party.sender.surname}`,
});

const mapOrganizationSender = (party: Extract<Party, { relationship: 'organization' }>): AvsenderId => ({
  id: party.sender.organizationNumber,
  idType: 'ORGNR',
  navn: party.sender.name,
});

const mapUser = (party: Party): Pick<ApplicationPartyData, 'bruker'> =>
  party.user.kind === 'identified-person' ? { bruker: party.user.nationalIdentityNumber } : {};

const mapPartyToApplication = (party: Party): ApplicationPartyData => {
  if (party.relationship === 'self') {
    if (party.user.kind === 'identified-person') {
      return mapUser(party);
    }

    return {
      avsender: {
        navn: `${party.user.firstName} ${party.user.surname}`,
      },
    };
  }

  if (party.relationship === 'other-person') {
    return {
      ...mapUser(party),
      avsender: mapPersonSender(party),
    };
  }

  return {
    ...mapUser(party),
    avsender: mapOrganizationSender(party),
  };
};

export { mapPartyToApplication };
export type { ApplicationPartyData };
