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
  return `${skjemanummer} ${skjemaTittel}`;
}

export function genererVedleggSomSkalSendes(submission) {
  const prefix = "vedlegg";
  const vedleggSomSkalSendes = [];
  Object.entries(submission).forEach(([key, value]) => {
    if (key.startsWith(prefix) && value === "leggerVedNaa" && key.length > prefix.length) {
      vedleggSomSkalSendes.push(key);
    }
  });
  return vedleggSomSkalSendes;
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

export function genererVedleggsListe(form, submission) {
  const formComponents = flattenComponents(form.components);
  return genererVedleggSomSkalSendes(submission)
    .map((vedleggsKode) => formComponents.find((component) => component.key === vedleggsKode))
    .map((component) => component.properties.vedleggstittel);
}

export function genererDokumentlisteFoersteside(skjemaTittel, skjemanummer, form, submission) {
  const formComponents = flattenComponents(form.components);
  return [
    genererSkjemaTittel(skjemaTittel, skjemanummer),
    ...genererVedleggSomSkalSendes(submission)
      .map((vedleggsKode) => formComponents.find((component) => component.key === vedleggsKode))
      .map((component) => component.label),
  ];
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
    properties: { skjemanummer, tema },
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
    tema,
    vedleggsliste: genererVedleggsListe(form, submission),
    dokumentlisteFoersteside: genererDokumentlisteFoersteside(title, skjemanummer, form, submission),
    netsPostboks: "1400",
  };
}
