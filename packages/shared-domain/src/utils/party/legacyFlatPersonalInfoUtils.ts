import { ConcernedPerson, Form, PartyAddress, SubmissionData } from '../../models';
import { navFormUtils } from '../form';

type LegacyFlatPersonalInfoSubmission = {
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
};

const legacyFlatPersonalInfoComponentKeys = [
  'fornavnSoker',
  'etternavnSoker',
  'coSoker',
  'postnummerSoker',
  'postnrSoker',
  'utenlandskPostkodeSoker',
  'poststedSoker',
  'landSoker',
  'gateadresseSoker',
  'norskVegadresse',
  'norskPostboksadresse',
  'utenlandskAdresse',
  'fodselsnummerDNummerSoker',
] as const;

const mapLegacyFlatAddress = (submission: LegacyFlatPersonalInfoSubmission): PartyAddress => {
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

const hasAddress = (address: PartyAddress): boolean =>
  !!(
    address.streetAddress ||
    address.postOfficeBox ||
    address.building ||
    address.postalCode ||
    address.postalName ||
    address.region ||
    address.country?.value
  );

const mapLegacyFlatUser = (submissionData: SubmissionData): ConcernedPerson | undefined => {
  const submission = submissionData as LegacyFlatPersonalInfoSubmission;

  if (submission.fodselsnummerDNummerSoker) {
    return {
      kind: 'identified-person',
      nationalIdentityNumber: submission.fodselsnummerDNummerSoker,
    };
  }

  if (!submission.fornavnSoker || !submission.etternavnSoker) {
    return undefined;
  }

  const address = mapLegacyFlatAddress(submission);
  if (!hasAddress(address)) {
    return undefined;
  }

  return {
    kind: 'unidentified-person',
    firstName: submission.fornavnSoker,
    surname: submission.etternavnSoker,
    address,
  };
};

const hasLegacyFlatPersonalInfoComponents = (form: Form): boolean =>
  navFormUtils
    .flattenComponents(form.components)
    .some((component) =>
      legacyFlatPersonalInfoComponentKeys.includes(
        component.key as (typeof legacyFlatPersonalInfoComponentKeys)[number],
      ),
    );

const legacyFlatPersonalInfoUtils = {
  hasComponents: hasLegacyFlatPersonalInfoComponents,
  mapUser: mapLegacyFlatUser,
  mapAddress: mapLegacyFlatAddress,
};

export { legacyFlatPersonalInfoUtils };
export type { LegacyFlatPersonalInfoSubmission };
