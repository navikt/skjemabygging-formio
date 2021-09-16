type ForstesideType = 'SKJEMA' | 'ETTERSENDELSE';

interface Bruker {
  brukerId: string;
  brukerType: string;
}

interface UkjentBruker {
  ukjentBrukerPersoninfo: string;
}

interface KjentBruker {
  bruker: Bruker;
}

type BrukerInfo = KjentBruker | UkjentBruker;

interface ForstesideInfo {
  foerstesidetype: ForstesideType;
  navSkjemaId: string;
  spraakkode: string;
  overskriftstittel: string;
  arkivtittel: string;
  tema: string;
  vedleggsliste: string[];
  dokumentlisteFoersteside: string[];
  netsPostboks: string;
}

type ForstesideRequestBody = ForstesideInfo & BrukerInfo;

export function genererPersonalia(fnrEllerDnr, adresse): BrukerInfo {
  if (fnrEllerDnr) {
    return {
      bruker: {
        brukerId: fnrEllerDnr,
        brukerType: "PERSON",
      },
    };
  } else if (adresse) {
    return {
      ukjentBrukerPersoninfo:
        `${adresse.navn || ""}, ` +
        `${adresse.adresse || ""} ` +
        `${adresse.postnummer || ""} ` +
        `${adresse.sted || ""} ` +
        `${adresse.land || ""}.`,
    };
  } else {
    throw Error("User needs to submit either fodselsNummer or address");
  }
}

export function genererSkjemaTittel(skjemaTittel, skjemanummer) {
  return `${skjemanummer} ${skjemaTittel}`;
}

/**
 * Basert på at custom property vedleggskode er satt og at verdien er leggerVedNaa.
 */
export function genererVedleggKeysSomSkalSendes(form, submissionData) {
  return flattenComponents(form.components)
    .filter((component) => component.properties && !!component.properties.vedleggskode)
    .filter((vedlegg) => submissionData[vedlegg.key] === "leggerVedNaa")
    .map((vedlegg) => vedlegg.properties.vedleggskode);
}

export function flattenComponents(components) {
  return components.reduce(
    (flattenedComponents, currentComponent) => [
      ...flattenedComponents,
      currentComponent,
      ...(currentComponent.components ? flattenComponents(currentComponent.components) : []),
    ],
    []
  );
}

export function getVedleggsFelterSomSkalSendes(submissionData, form) {
  return flattenComponents(form.components)
    .filter((component) => component.properties && !!component.properties.vedleggskode)
    .filter((vedlegg) => submissionData[vedlegg.key] === "leggerVedNaa");
}

export function genererVedleggsListe(form, submissionData) {
  return getVedleggsFelterSomSkalSendes(submissionData, form).map((component) => component.properties.vedleggstittel);
}

export function genererDokumentlisteFoersteside(skjemaTittel, skjemanummer, form, submissionData) {
  return [
    genererSkjemaTittel(skjemaTittel, skjemanummer),
    ...getVedleggsFelterSomSkalSendes(submissionData, form).map((component) => component.label),
  ];
}

export function genererAdresse(submission) {
  const {
    gateadresseSoker,
    landSoker,
    postnrSoker,
    poststedSoker,
    fornavnSoker,
    etternavnSoker,
    utenlandskPostkodeSoker,
  } = submission;
  return {
    navn: `${fornavnSoker} ${etternavnSoker}`,
    adresse: gateadresseSoker,
    postnummer: postnrSoker || utenlandskPostkodeSoker,
    sted: poststedSoker,
    land: landSoker || "Norge",
  };
}

export function genererFoerstesideData(form, submission): ForstesideRequestBody {
  const {
    properties: { skjemanummer, tema },
    title,
  } = form;
  const { fodselsnummerDNummerSoker } = submission;
  const adresse = genererAdresse(submission);
  return {
    ...genererPersonalia(fodselsnummerDNummerSoker, adresse),
    foerstesidetype: "SKJEMA",
    navSkjemaId: skjemanummer,
    spraakkode: "NB",
    overskriftstittel: genererSkjemaTittel(title, skjemanummer),
    arkivtittel: genererSkjemaTittel(title, skjemanummer),
    tema,
    vedleggsliste: genererVedleggsListe(form, submission),
    dokumentlisteFoersteside: genererDokumentlisteFoersteside(title, skjemanummer, form, submission),
    netsPostboks: "1400",
  };
}
