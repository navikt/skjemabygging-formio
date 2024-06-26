import {
  ForstesideRequestBody,
  KjentBruker,
  Mottaksadresse,
  MottaksadresseData,
  NavFormType,
  navFormUtils,
  SubmissionAttachmentValue,
  SubmissionData,
  UkjentBruker,
} from '@navikt/skjemadigitalisering-shared-domain';

type BrukerInfo = KjentBruker | UkjentBruker;

const adressLine = (text, prefix?) => {
  if (text) {
    return prefix ? `${prefix} ${text}, ` : `${text}, `;
  }
  return '';
};

export function genererPersonalia(fnrEllerDnr?: string, adresse?: Adresse): BrukerInfo {
  if (fnrEllerDnr) {
    return {
      bruker: {
        brukerId: fnrEllerDnr,
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

export function genererSkjemaTittel(skjemaTittel, skjemanummer) {
  return `${skjemanummer} ${skjemaTittel}`;
}

export function getVedleggsFelterSomSkalSendes(submissionData: SubmissionData, form: NavFormType) {
  return navFormUtils
    .flattenComponents(form.components)
    .filter((component) => component.properties && !!component.properties.vedleggskode)
    .filter(
      (component) =>
        submissionData[component.key] === 'leggerVedNaa' ||
        (submissionData[component.key] as SubmissionAttachmentValue)?.key === 'leggerVedNaa',
    );
}

export function genererVedleggsListe(form: NavFormType, submissionData: SubmissionData): string[] {
  return getVedleggsFelterSomSkalSendes(submissionData, form).map((component) => component.properties!.vedleggstittel!);
}

export function genererDokumentlisteFoersteside(
  skjemaTittel: string,
  skjemanummer: string,
  form: NavFormType,
  submissionData: SubmissionData,
) {
  return [
    genererSkjemaTittel(skjemaTittel, skjemanummer),
    ...getVedleggsFelterSomSkalSendes(submissionData, form).map((component) => component.label),
  ];
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

const parseLanguage = (language) => {
  switch (language) {
    case 'nn-NO':
      return 'NN';
    case 'nb-NO':
      return 'NB';
    case 'en':
    default:
      return 'EN';
  }
};

export function genererMottaksadresse(
  mottaksadresseId: string | undefined,
  mottaksadresser: Mottaksadresse[],
  enhetNummer?: string,
): { adresse: MottaksadresseData } | { enhetsnummer?: string; netsPostboks: string } {
  if (mottaksadresseId) {
    const mottaksadresse = mottaksadresser.find((a) => a._id === mottaksadresseId);
    if (mottaksadresse) {
      return { adresse: { ...mottaksadresse.data } };
    }
  }
  if (enhetNummer) {
    return {
      enhetsnummer: enhetNummer,
      netsPostboks: '1400',
    };
  }
  return { netsPostboks: '1400' };
}

export function genererFoerstesideData(
  form,
  submission,
  language = 'nb-NO',
  mottaksadresser: Mottaksadresse[] = [],
  enhetNummer?: string,
): ForstesideRequestBody {
  const {
    properties: { skjemanummer, tema, mottaksadresseId },
    title,
  } = form;
  const { fodselsnummerDNummerSoker } = submission;
  const adresse = genererAdresse(submission);
  return {
    ...genererPersonalia(fodselsnummerDNummerSoker, adresse),
    foerstesidetype: 'SKJEMA',
    navSkjemaId: skjemanummer,
    spraakkode: parseLanguage(language),
    overskriftstittel: genererSkjemaTittel(title, skjemanummer),
    arkivtittel: genererSkjemaTittel(title, skjemanummer),
    tema,
    vedleggsliste: genererVedleggsListe(form, submission),
    dokumentlisteFoersteside: genererDokumentlisteFoersteside(title, skjemanummer, form, submission),
    ...genererMottaksadresse(mottaksadresseId, mottaksadresser, enhetNummer),
  };
}
