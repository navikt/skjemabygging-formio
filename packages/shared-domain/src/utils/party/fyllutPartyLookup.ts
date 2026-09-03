import {
  Form,
  PartyAddress,
  SubmissionAddress,
  SubmissionData,
  SubmissionSender,
  SubmissionYourInformation,
} from '../../models';
import { senderUtils, yourInformationUtils } from '../submission';
import { PartyValueLookup, PersonValue } from './partyResolver';

interface FyllutPartyLookupOptions {
  legacyIdentityFallback?: boolean;
}

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

const mapAddress = (address: SubmissionAddress): PartyAddress => ({
  co: address.co,
  postOfficeBox: address.postboks,
  streetAddress: address.adresse,
  building: address.bygning,
  postalCode: address.postnummer,
  postalName: address.bySted,
  region: address.region,
  country: address.land,
});

const mapLegacyAddress = (submission: LegacySubmission): PartyAddress => {
  const {
    coSoker,
    gateadresseSoker,
    poststedSoker,
    postnummerSoker,
    postnrSoker,
    landSoker,
    utenlandskPostkodeSoker,
    norskVegadresse,
    norskPostboksadresse,
    utenlandskAdresse,
  } = submission;
  const country = landSoker || utenlandskAdresse?.landSoker || (norskVegadresse || norskPostboksadresse ? 'Norge' : '');

  return {
    co: norskVegadresse?.coSoker || utenlandskAdresse?.coSoker || coSoker,
    postOfficeBox:
      (norskPostboksadresse?.postboksNrSoker && `Postboks ${norskPostboksadresse.postboksNrSoker}`) ||
      utenlandskAdresse?.postboksNrSoker,
    streetAddress: norskVegadresse?.vegadresseSoker || gateadresseSoker,
    building: utenlandskAdresse?.bygningSoker,
    postalCode:
      norskVegadresse?.postnrSoker ||
      norskPostboksadresse?.postnrSoker ||
      utenlandskAdresse?.postkodeSoker ||
      postnrSoker ||
      utenlandskPostkodeSoker ||
      postnummerSoker,
    postalName:
      norskVegadresse?.poststedSoker ||
      norskPostboksadresse?.poststedSoker ||
      utenlandskAdresse?.poststedSoker ||
      poststedSoker,
    region: utenlandskAdresse?.regionSoker,
    country: {
      value: country,
      label: country,
    },
  };
};

const readYourInformation = (form: Form, submission: SubmissionData): SubmissionYourInformation | undefined =>
  yourInformationUtils.getYourInformation(form, submission);

const readSender = (form: Form, submission: SubmissionData): SubmissionSender | undefined =>
  senderUtils.getSender(form, submission);

const readUser = (form: Form, submission: SubmissionData, options: FyllutPartyLookupOptions): PersonValue => {
  const yourInformation = readYourInformation(form, submission);
  if (yourInformation) {
    const legacyIdentity = submission.fodselsnummerDNummerSoker;
    return {
      firstName: yourInformation.fornavn,
      surname: yourInformation.etternavn,
      nationalIdentityNumber:
        yourInformation.identitet?.identitetsnummer ||
        (options.legacyIdentityFallback && typeof legacyIdentity === 'string' ? legacyIdentity : undefined),
      address: yourInformation.adresse ? mapAddress(yourInformation.adresse) : undefined,
    };
  }

  const legacy = submission as LegacySubmission;
  return {
    firstName: legacy.fornavnSoker,
    surname: legacy.etternavnSoker,
    nationalIdentityNumber: legacy.fodselsnummerDNummerSoker,
    address: legacy.fodselsnummerDNummerSoker ? undefined : mapLegacyAddress(legacy),
  };
};

const createFyllutPartyLookup = (form: Form, options: FyllutPartyLookupOptions = {}): PartyValueLookup => ({
  relationship: (submission) => {
    const sender = readSender(form, submission.data);
    if (sender?.organization) {
      return 'organization';
    }
    if (sender?.person || (submission.data.fornavnAvsender && submission.data.etternavnAvsender)) {
      return 'other-person';
    }
    return 'self';
  },
  user: (submission) => readUser(form, submission.data, options),
  sender: (submission) => {
    const sender = readSender(form, submission.data);
    if (sender?.person) {
      return {
        firstName: sender.person.firstName,
        surname: sender.person.surname,
        nationalIdentityNumber: sender.person.nationalIdentityNumber,
      };
    }

    const legacy = submission.data as LegacySubmission;
    if (legacy.fornavnAvsender || legacy.etternavnAvsender) {
      return {
        firstName: legacy.fornavnAvsender,
        surname: legacy.etternavnAvsender,
      };
    }
  },
  organization: (submission) => {
    const organization = readSender(form, submission.data)?.organization;
    if (organization) {
      return {
        name: organization.name,
        organizationNumber: organization.number,
      };
    }
  },
});

export { createFyllutPartyLookup };
export type { FyllutPartyLookupOptions };
