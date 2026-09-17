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

const getConcernedPerson = (form: Form, submission: SubmissionData): ConcernedPerson | undefined => {
  const legacySubmission = submission as LegacyFlatPersonalInfoSubmission;

  if (navFormUtils.hasComponent(form, 'fodselsnummerDNummerSoker') && legacySubmission.fodselsnummerDNummerSoker) {
    return { kind: 'identified-person', nationalIdentityNumber: legacySubmission.fodselsnummerDNummerSoker };
  }

  const hasPersonalInformation = legacyFlatPersonalInfoComponentKeys
    .filter((key) => key !== 'fodselsnummerDNummerSoker')
    .some(
      (key) => navFormUtils.hasComponent(form, key) && (legacySubmission as Record<string, unknown>)[key] !== undefined,
    );

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
  getConcernedPerson,
  mapAddress: mapLegacyFlatAddress,
};

export { legacyFlatPersonalInfoUtils };
export type { LegacyFlatPersonalInfoSubmission };
