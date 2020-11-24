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

function getVedleggTittel(vedleggsKode, components) {
  components.map((component) => {
    component.components.map((insideComponent) => {
      console.log("im here");
      if (insideComponent.label === "vedleggTittel") {
        console.log(insideComponent.properties);
      }
    });
  });

  const vedleggsTitler = components.map((label) => {
    console.log(label);
  });

  return vedleggsTitler;
}

/*
function getVedleggTittel(vedleggsKode) {
  const vedleggsTitler = {
    Q7: "Dokumentasjon av utgifter i forbindelse med utdanning",
    O9: "Bekreftelse fra studiested/skole",
  };
  return vedleggsTitler[vedleggsKode];
}
*/

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

export function genererVedleggsListe(submission, components) {
  return genererVedleggSomSkalSendes(submission).map((vedleggsKode) => getVedleggTittel(vedleggsKode, components));
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
    fornavnsoker,
    etternavnsoker,
    utenlandskPostkodeSoker,
  } = submission;
  return {
    navn: `${fornavnsoker} ${etternavnsoker}`,
    adresse: gateadresse,
    postnummer: postnummer || utenlandskPostkodeSoker,
    sted: poststedSoker,
    land: land || "Norge",
  };
}

export function genererFoerstesideData(form, submission) {
  const {
    properties: { skjemanummer, tema },
    title,
    components,
  } = form;
  const { fodselsnummerDNummer } = submission;
  const adresse = genererAdresse(submission);
  return {
    foerstesidetype: "SKJEMA",
    navSkjemaId: skjemanummer,
    spraakkode: "NB",
    overskriftstittel: genererSkjemaTittel(title, skjemanummer),
    arkivtittel: genererSkjemaTittel(title, skjemanummer),
    tema: tema,
    vedleggsliste: genererVedleggsListe(submission, components),
    dokumentlisteFoersteside: genererDokumentlisteFoersteside(title, skjemanummer, submission),
    ...genererPersonalia(fodselsnummerDNummer, adresse),
    netsPostboks: "1400",
  };
}
