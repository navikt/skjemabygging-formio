import {
  flattenComponents,
  genererAdresse,
  genererDokumentlisteFoersteside,
  genererFoerstesideData,
  genererPersonalia,
  genererSkjemaTittel,
  genererVedleggsListe,
  genererVedleggSomSkalSendes,
} from "./forsteside";

describe("genererPersonalia", () => {
  it("returns bruker if we have fodselsNummer", () => {
    const actual = genererPersonalia("12345678911", {});
    expect(actual).toEqual({
      bruker: {
        brukerId: "12345678911",
        brukerType: "PERSON",
      },
    });
  });

  it("returns ukjentBruker if we do not have fodselsNummer", () => {
    const actual = genererPersonalia(null, {
      navn: "Test Testesen",
      adresse: "Testveien 1",
      postNummer: "1234",
      sted: "Oslo",
      land: "Norge",
    });
    expect(actual).toEqual({
      ukjentBrukerPersonInfo: "Test Testesen, Testveien 1 1234 Oslo Norge.",
    });
  });

  it("throws error is both fodselsNummer and address is missing", () => {
    expect(() => genererPersonalia(null, null)).toThrowError("User needs to submit either fodselsNummer or address");
  });
});

describe("genererSkjemaTittel", () => {
  it("generates correct skjemaTittel", () => {
    const actual = genererSkjemaTittel("Registreringsskjema for tilskudd til utdanning", "NAV 76-07.10");
    expect(actual).toEqual("Registreringsskjema for tilskudd til utdanning NAV 76-07.10");
  });
});

describe("genererVedleggSomSkalSendes", () => {
  it("adds vedlegg marked as leggerVedNaa", () => {
    const actual = genererVedleggSomSkalSendes({
      vedleggQ7: "leggerVedNaa",
      vedleggO9: "leggerVedNaa",
    });
    expect(actual).toEqual(["vedleggQ7", "vedleggO9"]);
  });

  it("does not add vedlegg marked as ettersender", () => {
    const actual = genererVedleggSomSkalSendes({
      vedleggQ7: "leggerVedNaa",
      vedleggO9: "ettersender",
    });
    expect(actual).toEqual(["vedleggQ7"]);
  });

  it("does not add vedlegg marked as levertTidligere", () => {
    const actual = genererVedleggSomSkalSendes({
      vedleggQ7: "levertTidligere",
      vedleggO9: "leggerVedNaa",
    });
    expect(actual).toEqual(["vedleggO9"]);
  });
});

describe("flattenComponents", () => {
  it("returns a flat array of all nested components", () => {
    const actual = flattenComponents([
      {
        title: "Personopplysninger",
        key: "panel",
        properties: {},
        type: "panel",
        label: "Panel",
        components: [
          {
            key: "fodselsnummerDNummer",
            type: "fnrfield",
            label: "Fødselsnummer / D-nummer",
            properties: {},
          },
          {
            label: "Fornavn",
            type: "textfield",
            key: "fornavn",
            properties: {},
          },
        ],
      },
    ]);
    expect(actual).toEqual([
      {
        title: "Personopplysninger",
        key: "panel",
        properties: {},
        type: "panel",
        label: "Panel",
        components: [
          {
            key: "fodselsnummerDNummer",
            type: "fnrfield",
            label: "Fødselsnummer / D-nummer",
            properties: {},
          },
          {
            label: "Fornavn",
            type: "textfield",
            key: "fornavn",
            properties: {},
          },
        ],
      },
      {
        key: "fodselsnummerDNummer",
        type: "fnrfield",
        label: "Fødselsnummer / D-nummer",
        properties: {},
      },
      {
        label: "Fornavn",
        type: "textfield",
        key: "fornavn",
        properties: {},
      },
    ]);
  });
});

const formMedVedlegg = {
  components: [
    {
      title: "Vedlegg",
      key: "page5",
      properties: {},
      type: "panel",
      label: "Page 5",
      components: [
        {
          label: "Skriftlig bekreftelse på studieplass",
          values: [
            { label: "Jeg legger det ved denne søknaden (anbefalt)", value: "leggerVedNaa", shortcut: "" },
            {
              label:
                "Jeg ettersender dokumentasjonen senere (jeg er klar over at NAV ikke kan behandle søknaden før jeg har levert dokumentasjonen)",
              value: "ettersender",
              shortcut: "",
            },
            { label: "Jeg har levert denne dokumentasjonen tidligere", value: "levertTidligere", shortcut: "" },
          ],
          key: "vedleggO9",
          properties: {
            vedleggstittel: "Bekreftelse fra studiested/skole",
          },
          type: "radio",
        },
        {
          label: "Faktura fra utdanningsinstitusjon",
          values: [
            { label: "Jeg legger det ved denne søknaden (anbefalt)", value: "leggerVedNaa", shortcut: "" },
            {
              label:
                "Jeg ettersender dokumentasjonen senere (jeg er klar over at NAV ikke kan behandle søknaden før jeg har levert dokumentasjonen)",
              value: "ettersender",
              shortcut: "",
            },
            { label: "Jeg har levert denne dokumentasjonen tidligere", value: "sendtTidligere", shortcut: "" },
          ],
          key: "vedleggQ7",
          properties: {
            vedleggstittel: "Dokumentasjon av utgifter i forbindelse med utdanning",
          },
          type: "radio",
        },
      ],
    },
  ],
};

describe("genererVedleggsListe", () => {
  it("generates correct vedleggsListe", () => {
    const actual = genererVedleggsListe(formMedVedlegg, { vedleggQ7: "leggerVedNaa", vedleggO9: "leggerVedNaa" });
    expect(actual).toEqual([
      "Dokumentasjon av utgifter i forbindelse med utdanning",
      "Bekreftelse fra studiested/skole",
    ]);
  });

  it("handles correctly when no vedlegg will be submitted", () => {
    const actual = genererVedleggsListe(formMedVedlegg, { vedleggQ7: "ettersender" });
    expect(actual).toEqual([]);
  });
});

describe("genererDokumentListeFoersteside", () => {
  it("generates correct dokumentListeFoersteside", () => {
    const actual = genererDokumentlisteFoersteside(
      "Registreringsskjema for tilskudd til utdanning",
      "NAV 76-07.10",
      formMedVedlegg,
      {
        vedleggQ7: "leggerVedNaa",
        vedleggO9: "leggerVedNaa",
      }
    );
    expect(actual).toEqual([
      "Registreringsskjema for tilskudd til utdanning NAV 76-07.10",
      "Faktura fra utdanningsinstitusjon",
      "Skriftlig bekreftelse på studieplass",
    ]);
  });
});

describe("genererAdresse", () => {
  it("generates correct Norwegian address", () => {
    const actual = genererAdresse({
      gateadresse: "Testveien 1",
      postnummer: "1234",
      poststedSoker: "Oslo",
      personalia: { fornavn: "Test", etternavn: "Testesen" },
    });
    expect(actual).toEqual({
      navn: `Test Testesen`,
      adresse: "Testveien 1",
      postnummer: "1234",
      sted: "Oslo",
      land: "Norge",
    });
  });

  it("generates correct foreign address", () => {
    const actual = genererAdresse({
      gateadresse: "Testveien 1",
      land: "USA",
      utenlandskPostkodeSoker: "1234",
      poststedSoker: "NY",
      personalia: { fornavn: "Test", etternavn: "Testesen" },
    });
    expect(actual).toEqual({
      navn: `Test Testesen`,
      adresse: "Testveien 1",
      postnummer: "1234",
      sted: "NY",
      land: "USA",
    });
  });

  it("generates correct foreign address without utenlandskPostkodeSoker", () => {
    const actual = genererAdresse({
      gateadresse: "Testveien 1",
      land: "USA",
      poststedSoker: "NY",
      personalia: { fornavn: "Test", etternavn: "Testesen" },
    });
    expect(actual).toEqual({
      navn: `Test Testesen`,
      adresse: "Testveien 1",
      sted: "NY",
      land: "USA",
    });
  });
});

describe("genererFoerstesideData", () => {
  it("correctly generates foersteside data", () => {
    const actual = genererFoerstesideData(
      {
        properties: { skjemanummer: "NAV 76-07.10", tema: "OPP" },
        title: "Registreringsskjema for tilskudd til utdanning",
        ...formMedVedlegg,
      },
      {
        gateadresse: "Testveien 1",
        land: "USA",
        utenlandskPostkodeSoker: "1234",
        poststedSoker: "NY",
        personalia: { fornavn: "Test", etternavn: "Testesen", fodselsnummerDNummer: "12345678911" },
        vedleggQ7: "leggerVedNaa",
        vedleggO9: "leggerVedNaa",
      }
    );
    expect(actual).toEqual({
      foerstesidetype: "SKJEMA",
      navSkjemaId: "NAV 76-07.10",
      spraakkode: "NB",
      overskriftstittel: "Registreringsskjema for tilskudd til utdanning NAV 76-07.10",
      arkivtittel: "Registreringsskjema for tilskudd til utdanning NAV 76-07.10",
      tema: "OPP",
      vedleggsliste: ["Dokumentasjon av utgifter i forbindelse med utdanning", "Bekreftelse fra studiested/skole"],
      dokumentlisteFoersteside: [
        "Registreringsskjema for tilskudd til utdanning NAV 76-07.10",
        "Faktura fra utdanningsinstitusjon",
        "Skriftlig bekreftelse på studieplass",
      ],
      bruker: {
        brukerId: "12345678911",
        brukerType: "PERSON",
      },
      netsPostboks: "1400",
    });
  });
});
