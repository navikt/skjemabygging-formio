export function genererPersonalia(fodselsNummer, adresse) {
  if (fodselsNummer) {
    return {
      bruker: {
        brukerId: fodselsNummer,
        brukerType: "PERSON",
      },
    };
  } else if (adresse) {
    return {
      ukjentBrukerPersonInfo:
        `${adresse.navn || ""}, ` +
        `${adresse.adresse || ""} ` +
        `${adresse.postNummer || ""} ` +
        `${adresse.sted || ""} ` +
        `${adresse.land || ""}.`,
    };
  } else {
    throw Error("User needs to submit either fodselsNummer or address");
  }
}

export function genererSkjemaTittel(skjemaTittel, skjemanummer) {
  return `${skjemaTittel} ${skjemanummer}`;
}

function getVedleggTittel(vedleggsKode) {
  const vedleggsTitler = {
    Q7: "Dokumentasjon av utgifter i forbindelse med utdanning",
    O9: "Bekreftelse fra studiested/skole",
  };
  return vedleggsTitler[vedleggsKode];
}

export function genererVedleggSomSkalSendes(submission) {
  const prefix = "vedlegg";
  const vedleggSomSkalSendes = [];
  Object.entries(submission).forEach(([key, value]) => {
    if (key.startsWith(prefix) && value === "leggerVedNaa" && key.length > prefix.length) {
      vedleggSomSkalSendes.push(key.substr(prefix.length));
    }
  });
  return vedleggSomSkalSendes;
}

export function genererVedleggsListe(submission) {
  return genererVedleggSomSkalSendes(submission).map((vedleggsKode) => getVedleggTittel(vedleggsKode));
}

export function genererDokumentlisteFoersteside(skjemaTittel, skjemanummer, submission) {
  return [genererSkjemaTittel(skjemaTittel, skjemanummer), ...genererVedleggsListe(submission)];
}

export function genererAdresse(submission) {
  const {
    gateadresse,
    land,
    postnummer,
    poststedSoker,
    personalia: { fornavn, etternavn },
    utenlandskPostkodeSoker,
  } = submission;
  return {
    navn: `${fornavn} ${etternavn}`,
    adresse: gateadresse,
    postnummer: postnummer || utenlandskPostkodeSoker,
    sted: poststedSoker,
    land: land || "Norge",
  };
}

export function genererFoerstesideData(form, submission) {
  const {
    properties: { skjemanummer },
    title,
  } = form;
  const {
    personalia: { fodselsnummerDNummer },
  } = submission;
  const adresse = genererAdresse(submission);
  return {
    ...genererPersonalia(fodselsnummerDNummer, adresse),
    foerstesidetype: "SKJEMA",
    navSkjemaId: skjemanummer,
    spraakkode: "NB",
    overskriftstittel: genererSkjemaTittel(title, skjemanummer),
    arkivtittel: genererSkjemaTittel(title, skjemanummer),
    tema: form.properties.tema,
    vedleggsliste: genererVedleggsListe(submission),
    dokumentlisteFoersteside: genererDokumentlisteFoersteside(title, skjemanummer, submission),
    netsPostboks: "1400",
  };
}
