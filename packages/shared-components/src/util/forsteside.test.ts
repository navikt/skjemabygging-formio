import {
  flattenComponents,
  ForstesideRequestBody,
  genererAdresse,
  genererDokumentlisteFoersteside,
  genererFoerstesideData,
  genererPersonalia,
  genererSkjemaTittel,
  genererVedleggKeysSomSkalSendes,
  genererVedleggsListe,
  getVedleggsFelterSomSkalSendes,
} from "./forsteside";

const genererVedleggComponent = (key, label, vedleggskode, vedleggstittel) => ({
  label,
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
  key,
  properties: {
    vedleggstittel,
    vedleggskode,
  },
  type: "radio",
});

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
      postnr: "1234",
      sted: "Oslo",
      land: "Norge",
    });
    expect(actual).toEqual({
      ukjentBrukerPersoninfo: "Test Testesen, Testveien 1, 1234 Oslo, Norge.",
    });
  });

  it("throws error is both fodselsNummer and address is missing", () => {
    expect(() => genererPersonalia(null, null)).toThrowError("User needs to submit either fodselsNummer or address");
  });
});

describe("genererSkjemaTittel", () => {
  it("generates correct skjemaTittel", () => {
    const actual = genererSkjemaTittel("Registreringsskjema for tilskudd til utdanning", "NAV 76-07.10");
    expect(actual).toEqual("NAV 76-07.10 Registreringsskjema for tilskudd til utdanning");
  });
});

describe("getVedleggsFelterSomSkalSendes", () => {
  it("adds all vedlegg which are set as leggerVedNaa", () => {
    const actual = getVedleggsFelterSomSkalSendes(
      {
        vedleggQ7: "leggerVedNaa",
        vedleggO9: "leggerVedNaa",
      },
      formMedVedlegg
    );
    expect(actual.map((component) => component.key)).toEqual(["vedleggO9", "vedleggQ7"]);
  });
  it("does not add vedlegg which should not be submitted now", () => {
    const actual = getVedleggsFelterSomSkalSendes(
      {
        vedleggQ7: "levertTidligere",
        vedleggO9: "ettersender",
      },
      formMedVedlegg
    );
    expect(actual.map((component) => component.key)).toEqual([]);
  });
  it("handles several vedlegg with the same vedleggskode", () => {
    const actual = getVedleggsFelterSomSkalSendes(
      {
        vedlegg1: "leggerVedNaa",
        vedlegg2: "leggerVedNaa",
        vedlegg3: "leggerVedNaa",
      },
      {
        components: [
          genererVedleggComponent("vedlegg1", "Label 1", "O9", "Vedleggstittel 1"),
          genererVedleggComponent("vedlegg2", "Label 2", "O9", "Vedleggstittel 2"),
          genererVedleggComponent("vedlegg3", "Label 3", "Q7", "Vedleggstittel 3"),
        ],
      }
    );
    expect(actual.map((component) => component.key)).toEqual(["vedlegg1", "vedlegg2", "vedlegg3"]);
  });
});

describe("genererVedleggSomSkalSendes", () => {
  it("adds vedlegg marked as leggerVedNaa", () => {
    const actual = genererVedleggKeysSomSkalSendes(formMedVedlegg, {
      vedleggQ7: "leggerVedNaa",
      vedleggO9: "leggerVedNaa",
    });
    expect(actual).toEqual(["O9", "Q7"]);
  });

  it("does not add vedlegg marked as ettersender", () => {
    const actual = genererVedleggKeysSomSkalSendes(formMedVedlegg, {
      vedleggQ7: "leggerVedNaa",
      vedleggO9: "ettersender",
    });
    expect(actual).toEqual(["Q7"]);
  });

  it("does not add vedlegg marked as levertTidligere", () => {
    const actual = genererVedleggKeysSomSkalSendes(formMedVedlegg, {
      vedleggQ7: "levertTidligere",
      vedleggO9: "leggerVedNaa",
    });
    expect(actual).toEqual(["O9"]);
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
    expect(actual.map((component) => component.key)).toEqual(["panel", "fodselsnummerDNummer", "fornavn"]);
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
        genererVedleggComponent(
          "vedleggO9",
          "Skriftlig bekreftelse på studieplass",
          "O9",
          "Bekreftelse fra studiested/skole"
        ),
        genererVedleggComponent(
          "vedleggQ7",
          "Faktura fra utdanningsinstitusjon",
          "Q7",
          "Dokumentasjon av utgifter i forbindelse med utdanning"
        ),
      ],
    },
  ],
};

describe("genererVedleggsListe", () => {
  it("generates correct vedleggsListe", () => {
    const actual = genererVedleggsListe(formMedVedlegg, { vedleggQ7: "leggerVedNaa", vedleggO9: "leggerVedNaa" });
    expect(actual).toEqual([
      "Bekreftelse fra studiested/skole",
      "Dokumentasjon av utgifter i forbindelse med utdanning",
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
      "NAV 76-07.10 Registreringsskjema for tilskudd til utdanning",
      "Skriftlig bekreftelse på studieplass",
      "Faktura fra utdanningsinstitusjon",
    ]);
  });
});

describe("genererAdresse", () => {
  it("generates correct Norwegian address", () => {
    const actual = genererAdresse({
      gateadresseSoker: "Testveien 1",
      postnrSoker: "1234",
      poststedSoker: "Oslo",
      fornavnSoker: "Test",
      etternavnSoker: "Testesen",
    });
    expect(actual).toEqual({
      navn: `Test Testesen`,
      adresse: "Testveien 1",
      postnr: "1234",
      sted: "Oslo",
      land: "Norge",
    });
  });

  it("generates correct foreign address", () => {
    const actual = genererAdresse({
      gateadresseSoker: "Testveien 1",
      landSoker: "USA",
      utenlandskPostkodeSoker: "1234",
      poststedSoker: "NY",
      fornavnSoker: "Test",
      etternavnSoker: "Testesen",
    });
    expect(actual).toEqual({
      navn: `Test Testesen`,
      adresse: "Testveien 1",
      postnr: "1234",
      sted: "NY",
      land: "USA",
    });
  });

  it("generates correct foreign address without utenlandskPostkodeSoker", () => {
    const actual = genererAdresse({
      gateadresseSoker: "Testveien 1",
      landSoker: "USA",
      poststedSoker: "NY",
      fornavnSoker: "Test",
      etternavnSoker: "Testesen",
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

  const defaultForm = {
    title: "Testskjema",
    properties: {
      skjemanummer: "WIP 12.34-56",
      tema: "BIL"
    },
    components: []
  }

  it("correctly generates foersteside data", () => {
    const actual = genererFoerstesideData(
      {
        properties: { skjemanummer: "NAV 76-07.10", tema: "OPP" },
        title: "Registreringsskjema for tilskudd til utdanning",
        ...formMedVedlegg,
      },
      {
        gateadresseSoker: "Testveien 1",
        landSoker: "USA",
        utenlandskPostkodeSoker: "1234",
        poststedSoker: "NY",
        fornavnSoker: "Test",
        etternavnSoker: "Testesen",
        fodselsnummerDNummerSoker: "12345678911",
        vedleggQ7: "leggerVedNaa",
        vedleggO9: "leggerVedNaa",
      }
    );
    expect(actual).toEqual({
      foerstesidetype: "SKJEMA",
      navSkjemaId: "NAV 76-07.10",
      spraakkode: "NB",
      overskriftstittel: "NAV 76-07.10 Registreringsskjema for tilskudd til utdanning",
      arkivtittel: "NAV 76-07.10 Registreringsskjema for tilskudd til utdanning",
      tema: "OPP",
      vedleggsliste: ["Bekreftelse fra studiested/skole", "Dokumentasjon av utgifter i forbindelse med utdanning"],
      dokumentlisteFoersteside: [
        "NAV 76-07.10 Registreringsskjema for tilskudd til utdanning",
        "Skriftlig bekreftelse på studieplass",
        "Faktura fra utdanningsinstitusjon",
      ],
      bruker: {
        brukerId: "12345678911",
        brukerType: "PERSON",
      },
      netsPostboks: "1400",
    });
  });

  describe('Bruker uten fødselsnummer', () => {

    describe('med norsk vegadresse', () => {

      const navnPostnrPoststed = {
        fornavnSoker: "Solan",
        etternavnSoker: "Gundersen",
        postnrSoker: "3520",
        poststedSoker: "Jevnaker",
      };

      it("henter gate og husnummer fra gateadresseSoker", () => {
        const submission = {
          ...navnPostnrPoststed,
          gateadresseSoker: "Flåklypatoppen 1"
        }
        const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
        expect(forsteside.ukjentBrukerPersoninfo)
          .toEqual("Solan Gundersen, Flåklypatoppen 1, 3520 Jevnaker, Norge.")
      });

      it("henter gate og husnummer fra vegadresseSoker", () => {
        const submission = {
          ...navnPostnrPoststed,
          vegadresseSoker: "Flåklypatoppen 1",
        }
        const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
        expect(forsteside.ukjentBrukerPersoninfo)
          .toEqual("Solan Gundersen, Flåklypatoppen 1, 3520 Jevnaker, Norge.")
      });

      it("legger til c/o-adressering", () => {
        const submission = {
          ...navnPostnrPoststed,
          coSoker: "Reodor Felgen",
          vegadresseSoker: "Flåklypatoppen 1",
        }
        const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
        expect(forsteside.ukjentBrukerPersoninfo)
          .toEqual("Solan Gundersen, c/o Reodor Felgen, Flåklypatoppen 1, 3520 Jevnaker, Norge.")
      });

    });

    describe('med norsk postboksadresse', () => {

      it("Tar med navn på eier av postboksen", () => {
        const submission = {
          fornavnSoker: "Solan",
          etternavnSoker: "Gundersen",
          navnPaEierAvPostboksenSoker: "Reodor Felgen",
          postboksSoker: "55 Toppen",
          postboksPostnrSoker: "3520",
          postboksPoststedSoker: "Jevnaker",
        };
        const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
        expect(forsteside.ukjentBrukerPersoninfo)
          .toEqual("Solan Gundersen, c/o Reodor Felgen, Postboks 55 Toppen, 3520 Jevnaker, Norge.")
      });

      it("Tar hensyn til at det er valgfritt å oppgi eier på postboks", () => {
        const submission = {
          fornavnSoker: "Solan",
          etternavnSoker: "Gundersen",
          navnPaEierAvPostboksenSoker: undefined,
          postboksSoker: "55 Toppen",
          postboksPostnrSoker: "3520",
          postboksPoststedSoker: "Jevnaker",
        };
        const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
        expect(forsteside.ukjentBrukerPersoninfo)
          .toEqual("Solan Gundersen, Postboks 55 Toppen, 3520 Jevnaker, Norge.")
      });

    });

    describe('med utenlandsk adresse', () => {

      it("Formatteres korrekt", () => {
        const submission = {
          fornavnSoker: "Solan",
          etternavnSoker: "Gundersen",
          utlandCoSoker: undefined,
          utlandVegadresseOgHusnummerSoker: "12603 Denmark Drive",
          utlandBygningSoker: "Apt.556",
          utlandPostkodeSoker: "VA 22071-9945",
          utlandByStedSoker: "Herndon",
          utlandRegionSoker: undefined,
          utlandLandSoker: "USA",
        };
        const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
        expect(forsteside.ukjentBrukerPersoninfo)
          .toEqual("Solan Gundersen, 12603 Denmark Drive, Apt.556, VA 22071-9945 Herndon, USA.")
      });

      it("Formatteres korrekt med c/o-adressering", () => {
        const submission = {
          fornavnSoker: "Solan",
          etternavnSoker: "Gundersen",
          utlandCoSoker: "Bart Simpson",
          utlandVegadresseOgHusnummerSoker: "12603 Denmark Drive",
          utlandBygningSoker: "Apt.556",
          utlandPostkodeSoker: "VA 22071-9945",
          utlandByStedSoker: "Herndon",
          utlandRegionSoker: undefined,
          utlandLandSoker: "USA",
        };
        const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
        expect(forsteside.ukjentBrukerPersoninfo)
          .toEqual("Solan Gundersen, c/o Bart Simpson, 12603 Denmark Drive, Apt.556, VA 22071-9945 Herndon, USA.")
      });

      it("Formatteres korrekt med region", () => {
        const submission = {
          fornavnSoker: "Solan",
          etternavnSoker: "Gundersen",
          utlandCoSoker: undefined,
          utlandVegadresseOgHusnummerSoker: "12603 Denmark Drive",
          utlandBygningSoker: "Apt.556",
          utlandPostkodeSoker: "VA 22071-9945",
          utlandByStedSoker: "Herndon",
          utlandRegionSoker: "Dulles",
          utlandLandSoker: "USA",
        };
        const forsteside: ForstesideRequestBody = genererFoerstesideData(defaultForm, submission);
        expect(forsteside.ukjentBrukerPersoninfo)
          .toEqual("Solan Gundersen, 12603 Denmark Drive, Apt.556, VA 22071-9945 Herndon, Dulles, USA.")
      });

    });

  });

});
