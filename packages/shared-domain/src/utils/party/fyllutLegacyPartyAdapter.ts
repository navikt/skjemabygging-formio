import { PartyAddress } from '../../models';
import { hasAddressValue } from './partyAddress';

type FyllutLegacySubmission = {
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

const mapFyllutLegacyAddress = (submission: FyllutLegacySubmission): PartyAddress => {
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

const hasLegacyPersonSender = (submission: FyllutLegacySubmission): boolean =>
  !!submission.fornavnAvsender && !!submission.etternavnAvsender;

/**
 * Legacy submissions always produce an address object, so an address is only a usable party value
 * when it carries populated values.
 */
const mapFyllutLegacyPartyAddress = (submission: FyllutLegacySubmission): PartyAddress | undefined => {
  const address = mapFyllutLegacyAddress(submission);
  return hasAddressValue(address) ? address : undefined;
};

export { hasLegacyPersonSender, mapFyllutLegacyAddress, mapFyllutLegacyPartyAddress };
export type { FyllutLegacySubmission };
