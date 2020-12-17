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

export function genererVedleggKeysSomSkalSendes(submissionData) {
  const prefix = "vedlegg";
  const vedleggKeysSomSkalSendes = [];
  Object.entries(submissionData).forEach(([key, value]) => {
    if (key.startsWith(prefix) && value === "leggerVedNaa" && key.length > prefix.length) {
      vedleggKeysSomSkalSendes.push(key);
    }
  });
  return vedleggKeysSomSkalSendes;
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
  const flattenedFormComponents = flattenComponents(form.components);
  return genererVedleggKeysSomSkalSendes(submissionData).map((vedleggsKey) =>
    flattenedFormComponents.find((component) => component.key === vedleggsKey)
  );
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
    postnummerSoker,
    poststedSoker,
    fornavnSoker,
    etternavnSoker,
    utenlandskPostkodeSoker,
  } = submission;
  return {
    navn: `${fornavnSoker} ${etternavnSoker}`,
    adresse: gateadresseSoker,
    postnummer: postnummerSoker || utenlandskPostkodeSoker,
    sted: poststedSoker,
    land: landSoker || "Norge",
  };
}

export function genererFoerstesideData(form, submission) {
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
