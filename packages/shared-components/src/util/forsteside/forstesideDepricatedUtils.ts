import { KjentBruker, UkjentBruker } from '@navikt/skjemadigitalisering-shared-domain';

type BrukerInfo = KjentBruker | UkjentBruker;

const adressLine = (text, prefix?) => {
  if (text) {
    return prefix ? `${prefix} ${text}, ` : `${text}, `;
  }
  return '';
};

export function genererPersonalia(submission: any): BrukerInfo {
  if (!submission) {
    throw Error('User needs to submit either fodselsNummer or address');
  }

  const adresse = genererAdresse(submission);

  if (submission?.fodselsnummerDNummerSoker) {
    return {
      bruker: {
        brukerId: submission.fodselsnummerDNummerSoker,
        brukerType: 'PERSON',
      },
    };
  } else if (adresse) {
    return {
      ukjentBrukerPersoninfo:
        adressLine(adresse.navn) +
        adressLine(adresse.co, 'c/o') +
        adressLine(adresse.postboksEier, 'c/o') +
        adressLine(adresse.adresse) +
        adressLine(adresse.bygning) +
        (adresse.postnr || '') +
        (adresse.sted ? ` ${adressLine(adresse.sted)}` : '') +
        adressLine(adresse.region) +
        (adresse.land ? `${adresse.land}.` : ''),
    };
  } else {
    throw Error('User needs to submit either fodselsNummer or address');
  }
}

interface NorskVegadresse {
  coSoker: string;
  vegadresseSoker: string;
  postnrSoker: string;
  poststedSoker: string;
}

interface NorskPostboksAdresse {
  coSoker: string;
  postboksNrSoker: string;
  postnrSoker: string;
  poststedSoker: string;
}

interface UtenlandskAdresse {
  coSoker: string;
  postboksNrSoker: string;
  bygningSoker: string;
  postkodeSoker: string;
  poststedSoker: string;
  landSoker: string;
  regionSoker: string;
}

type Submission = {
  fornavnSoker: string;
  etternavnSoker: string;
  coSoker?: string;
  postnummerSoker?: string;
  postnrSoker?: string;
  utenlandskPostkodeSoker?: string;
  poststedSoker: string;
  landSoker?: string;
  gateadresseSoker?: string;
  norskVegadresse?: NorskVegadresse;
  norskPostboksadresse?: NorskPostboksAdresse;
  utenlandskAdresse?: UtenlandskAdresse;
};

type Adresse = {
  navn: string;
  co?: string;
  postboksEier?: string;
  adresse?: string;
  bygning?: string;
  postnr?: string;
  sted: string;
  region?: string;
  land?: string;
};

export function genererAdresse(submission: Submission): Adresse {
  const {
    fornavnSoker,
    etternavnSoker,
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
  return {
    navn: fornavnSoker || etternavnSoker ? `${fornavnSoker} ${etternavnSoker}` : '',
    co: (norskVegadresse && norskVegadresse.coSoker) || (utenlandskAdresse && utenlandskAdresse.coSoker) || coSoker,
    postboksEier: norskPostboksadresse && norskPostboksadresse.coSoker,
    adresse:
      (norskVegadresse && norskVegadresse.vegadresseSoker) ||
      (norskPostboksadresse &&
        norskPostboksadresse.postboksNrSoker &&
        `Postboks ${norskPostboksadresse.postboksNrSoker}`) ||
      (utenlandskAdresse && utenlandskAdresse.postboksNrSoker) ||
      gateadresseSoker,
    bygning: utenlandskAdresse && utenlandskAdresse.bygningSoker,
    postnr:
      (norskVegadresse && norskVegadresse.postnrSoker) ||
      (norskPostboksadresse && norskPostboksadresse.postnrSoker) ||
      (utenlandskAdresse && utenlandskAdresse.postkodeSoker) ||
      postnrSoker ||
      utenlandskPostkodeSoker ||
      postnummerSoker,
    sted:
      (norskVegadresse && norskVegadresse.poststedSoker) ||
      (norskPostboksadresse && norskPostboksadresse.poststedSoker) ||
      (utenlandskAdresse && utenlandskAdresse.poststedSoker) ||
      poststedSoker,
    region: utenlandskAdresse && utenlandskAdresse.regionSoker,
    land:
      landSoker ||
      (utenlandskAdresse && utenlandskAdresse.landSoker) ||
      ((norskVegadresse || norskPostboksadresse) && 'Norge'),
  };
}
