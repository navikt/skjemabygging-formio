import { ConcernedPerson, PartyAddress, SubmissionData } from '../../models';

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

const hasSubmittedValue = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.some(hasSubmittedValue);
  }

  if (value && typeof value === 'object') {
    return Object.values(value).some(hasSubmittedValue);
  }

  return value !== undefined && value !== null;
};

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

const getConcernedUser = (submission: SubmissionData): ConcernedPerson | undefined => {
  const legacySubmission = submission as LegacyFlatPersonalInfoSubmission;
  const nationalIdentityNumber = legacySubmission.fodselsnummerDNummerSoker;

  if (nationalIdentityNumber?.trim()) {
    return { kind: 'identified-person', nationalIdentityNumber };
  }

  const hasPersonalInformation = legacyFlatPersonalInfoComponentKeys
    .filter((key) => key !== 'fodselsnummerDNummerSoker')
    .some((key) => hasSubmittedValue(legacySubmission[key]));

  return hasPersonalInformation
    ? {
        kind: 'unidentified-person',
        firstName: legacySubmission.fornavnSoker,
        surname: legacySubmission.etternavnSoker,
        address: mapLegacyFlatAddress(legacySubmission),
      }
    : undefined;
};

const legacyFlatPersonalInfoUtils = {
  getConcernedUser,
  mapAddress: mapLegacyFlatAddress,
};

export { legacyFlatPersonalInfoUtils };
export type { LegacyFlatPersonalInfoSubmission };
