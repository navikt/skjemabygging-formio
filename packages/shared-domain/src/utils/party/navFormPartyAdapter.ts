import {
  ConcernedUserInput,
  Form,
  NavFormType,
  PartyAddressInput,
  PartyInput,
  PersonInput,
  SubmissionAddress,
  SubmissionData,
  SubmissionYourInformation,
} from '../../models';
import { formatUtils } from '../format';
import { navFormUtils } from '../form';
import { senderUtils, yourInformationUtils } from '../submission';

type LegacySubmission = {
  fornavnSoker?: string;
  etternavnSoker?: string;
  coSoker?: string;
  postnummerSoker?: string;
  postnrSoker?: string;
  utenlandskPostkodeSoker?: string;
  poststedSoker?: string;
  landSoker?: string;
  gateadresseSoker?: string;
  norskVegadresse?: {
    coSoker?: string;
    vegadresseSoker?: string;
    postnrSoker?: string;
    poststedSoker?: string;
  };
  norskPostboksadresse?: {
    coSoker?: string;
    postboksNrSoker?: string;
    postnrSoker?: string;
    poststedSoker?: string;
  };
  utenlandskAdresse?: {
    coSoker?: string;
    postboksNrSoker?: string;
    bygningSoker?: string;
    postkodeSoker?: string;
    poststedSoker?: string;
    landSoker?: string;
    regionSoker?: string;
  };
  fodselsnummerDNummerSoker?: string;
  fornavnAvsender?: string;
  etternavnAvsender?: string;
};

interface NavFormPartyAdapterOptions {
  authenticatedIdentityNumber?: string;
}

type NavFormCoverPagePartyInput =
  | { type: 'party'; input: PartyInput }
  | { type: 'legacyOrganization'; organizationNumber: string };

const toAddressInput = (address: SubmissionAddress): PartyAddressInput => {
  const countryName = address.land?.label;
  const countryCode = address.land?.value || address.landkode;
  const isForeign =
    address.borDuINorge === 'nei' ||
    (countryCode && !['no', 'nor', 'norge'].includes(countryCode.toLowerCase())) ||
    Boolean(address.bygning || address.region);

  if (isForeign) {
    return {
      type: 'foreign',
      co: address.co,
      street: address.adresse,
      building: address.bygning,
      postalCode: address.postnummer,
      location: address.bySted,
      region: address.region,
      country: {
        code: countryCode,
        name: countryName,
      },
    };
  }
  if (address.vegadresseEllerPostboksadresse === 'postboksadresse' || address.postboks) {
    return {
      type: 'norwegianPostOfficeBox',
      co: address.co,
      postOfficeBox: address.postboks,
      postalCode: address.postnummer,
      postalName: address.bySted,
    };
  }
  return {
    type: 'norwegianStreet',
    co: address.co,
    street: address.adresse,
    postalCode: address.postnummer,
    postalName: address.bySted,
  };
};

const getLegacyAddressInput = (submission: LegacySubmission): PartyAddressInput => {
  const { norskVegadresse, norskPostboksadresse, utenlandskAdresse } = submission;
  if (utenlandskAdresse || submission.utenlandskPostkodeSoker || submission.landSoker) {
    const country = utenlandskAdresse?.landSoker || submission.landSoker;
    return {
      type: 'foreign',
      co: utenlandskAdresse?.coSoker || submission.coSoker,
      street: submission.gateadresseSoker,
      building: utenlandskAdresse?.bygningSoker,
      postalCode: utenlandskAdresse?.postkodeSoker || submission.utenlandskPostkodeSoker,
      location: utenlandskAdresse?.poststedSoker || submission.poststedSoker,
      region: utenlandskAdresse?.regionSoker,
      country: { name: country },
    };
  }
  if (norskPostboksadresse) {
    const postOfficeBox = norskPostboksadresse.postboksNrSoker;
    return {
      type: 'norwegianPostOfficeBox',
      co: norskPostboksadresse.coSoker || submission.coSoker,
      postOfficeBox: postOfficeBox ? `Postboks ${postOfficeBox}` : undefined,
      postalCode: norskPostboksadresse.postnrSoker || submission.postnrSoker || submission.postnummerSoker,
      postalName: norskPostboksadresse.poststedSoker || submission.poststedSoker,
    };
  }
  return {
    type: 'norwegianStreet',
    co: norskVegadresse?.coSoker || submission.coSoker,
    street: norskVegadresse?.vegadresseSoker || submission.gateadresseSoker,
    postalCode: norskVegadresse?.postnrSoker || submission.postnrSoker || submission.postnummerSoker,
    postalName: norskVegadresse?.poststedSoker || submission.poststedSoker,
  };
};

const toConcernedUser = (
  yourInformation: SubmissionYourInformation | undefined,
  submission: LegacySubmission,
): ConcernedUserInput => {
  const identityNumber = yourInformation?.identitet?.identitetsnummer || submission.fodselsnummerDNummerSoker;
  if (identityNumber) {
    return {
      type: 'identified',
      nationalIdentityNumber: identityNumber,
      firstName: yourInformation?.fornavn || submission.fornavnSoker,
      surname: yourInformation?.etternavn || submission.etternavnSoker,
    };
  }
  return {
    type: 'unidentified',
    firstName: yourInformation?.fornavn || submission.fornavnSoker,
    surname: yourInformation?.etternavn || submission.etternavnSoker,
    address: yourInformation?.adresse ? toAddressInput(yourInformation.adresse) : getLegacyAddressInput(submission),
  };
};

const toPersonInput = (
  firstName: string | undefined,
  surname: string | undefined,
  nationalIdentityNumber: string | undefined,
): PersonInput => ({
  type: 'person',
  firstName,
  surname,
  nationalIdentityNumber,
});

const getPartyInput = (
  form: NavFormType | Form,
  submissionData: SubmissionData,
  options: NavFormPartyAdapterOptions = {},
): PartyInput => {
  const legacySubmission = submissionData as LegacySubmission;
  const yourInformation = yourInformationUtils.getYourInformation(form, submissionData);
  const sender = senderUtils.getSender(form, submissionData);
  const concernedUser = toConcernedUser(yourInformation, legacySubmission);
  const authenticatedIdentityNumber = options.authenticatedIdentityNumber;

  const senderPerson = sender?.person;
  const fallbackNames =
    !sender && concernedUser.type !== 'severalPeople'
      ? { firstName: concernedUser.firstName, surname: concernedUser.surname }
      : {};
  const personFillingIn = toPersonInput(
    senderPerson?.firstName ?? fallbackNames.firstName,
    senderPerson?.surname ?? fallbackNames.surname,
    authenticatedIdentityNumber ?? senderPerson?.nationalIdentityNumber,
  );

  if (sender?.organization) {
    return {
      relationship: 'organization',
      personFillingIn,
      responsibleSender: {
        type: 'organization',
        name: sender.organization.name,
        organizationNumber: sender.organization.number,
      },
      concernedUser,
    };
  }
  if (senderPerson) {
    return {
      relationship: 'anotherPerson',
      personFillingIn,
      responsibleSender: personFillingIn,
      concernedUser,
    };
  }
  if (legacySubmission.fornavnAvsender && legacySubmission.etternavnAvsender) {
    const legacySender = toPersonInput(
      legacySubmission.fornavnAvsender,
      legacySubmission.etternavnAvsender,
      authenticatedIdentityNumber,
    );
    return {
      relationship: 'anotherPerson',
      personFillingIn: legacySender,
      responsibleSender: legacySender,
      concernedUser,
    };
  }

  const selfIdentityNumber =
    authenticatedIdentityNumber ??
    yourInformation?.identitet?.identitetsnummer ??
    legacySubmission.fodselsnummerDNummerSoker;
  const self = toPersonInput(
    yourInformation?.fornavn ?? legacySubmission.fornavnSoker,
    yourInformation?.etternavn ?? legacySubmission.etternavnSoker,
    selfIdentityNumber,
  );
  if (concernedUser.type === 'unidentified') {
    return {
      relationship: 'anotherPerson',
      personFillingIn: self,
      responsibleSender: self,
      concernedUser,
    };
  }
  return {
    relationship: 'self',
    personFillingIn: self,
    responsibleSender: self,
    concernedUser:
      selfIdentityNumber && concernedUser.type === 'identified'
        ? { ...concernedUser, nationalIdentityNumber: selfIdentityNumber }
        : concernedUser,
  };
};

const getLegacyCoverPageOrganization = (
  form: NavFormType | Form,
  submissionData: SubmissionData,
): { organizationNumber: string } | undefined => {
  const component = navFormUtils
    .flattenComponents(form.components)
    .find((candidate) => candidate.type === 'orgNr' && candidate.coverPageUser && submissionData[candidate.key]);
  const value = component && submissionData[component.key];
  const organizationNumber = value ? formatUtils.removeAllSpaces(`${value}`) : undefined;
  return organizationNumber ? { organizationNumber } : undefined;
};

const getCoverPagePartyInput = (
  form: NavFormType | Form,
  submissionData: SubmissionData,
  options: NavFormPartyAdapterOptions = {},
): NavFormCoverPagePartyInput => {
  const yourInformation = yourInformationUtils.getYourInformation(form, submissionData);
  if (!yourInformation) {
    const legacyOrganization = getLegacyCoverPageOrganization(form, submissionData);
    if (legacyOrganization) {
      return { type: 'legacyOrganization', ...legacyOrganization };
    }
  }
  return { type: 'party', input: getPartyInput(form, submissionData, options) };
};

const navFormPartyAdapter = {
  getCoverPagePartyInput,
  getLegacyCoverPageOrganization,
  getPartyInput,
};

export { navFormPartyAdapter };
export type { NavFormCoverPagePartyInput, NavFormPartyAdapterOptions };
