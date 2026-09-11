import { formatUtils, Party } from '@navikt/skjemadigitalisering-shared-domain';
import { AvsenderId, SubmitApplicationRequest } from './applicationTypes';

type ApplicationPartyData = Pick<SubmitApplicationRequest, 'bruker' | 'avsender'>;

type ResponsibleSender = Extract<Party, { onBehalfOf: 'other-person' }>['sender'];

const mapSender = (sender: ResponsibleSender): AvsenderId => ({
  id: formatUtils.removeAllSpaces(
    'organizationNumber' in sender ? sender.organizationNumber : sender.nationalIdentityNumber,
  ),
  idType: 'organizationNumber' in sender ? 'ORGNR' : 'FNR',
  navn: 'organizationNumber' in sender ? sender.name : `${sender.firstName} ${sender.surname}`,
});

const mapOrganizationSender = (party: Extract<Party, { onBehalfOf: 'multiple-people' }>): AvsenderId => ({
  id: formatUtils.removeAllSpaces(party.sender.organizationNumber),
  idType: 'ORGNR',
  navn: party.sender.name,
});

const mapUser = (
  party: Extract<Party, { onBehalfOf: 'self' | 'other-person' }>,
): Pick<ApplicationPartyData, 'bruker'> =>
  party.user.kind === 'identified-person'
    ? { bruker: formatUtils.removeAllSpaces(party.user.nationalIdentityNumber) }
    : {};

const mapPartyToApplication = (party: Party): ApplicationPartyData => {
  if (party.onBehalfOf === 'self') {
    if (party.user.kind === 'identified-person') {
      return mapUser(party);
    }

    return {
      avsender: {
        navn: `${party.user.firstName} ${party.user.surname}`,
      },
    };
  }

  if (party.onBehalfOf === 'other-person') {
    return {
      ...mapUser(party),
      avsender: mapSender(party.sender),
    };
  }

  return {
    avsender: mapOrganizationSender(party),
  };
};

export { mapPartyToApplication };
export type { ApplicationPartyData };
