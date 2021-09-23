import { SANITIZE_CONFIG } from "../template/sanitizeConfig";
//import { norskPostboksadresseSchema } from "./norskPostboksadresse";

const sokerPostfix = "Soker";

const builderEditForm = {
  // placeholder, just defines defaults. Modifiy this later
  textfield: [
    {
      key: "display",
      components: [],
    },
    {
      key: "data",
      components: [],
    },
    {
      key: "validation",
      components: [],
    },
    {
      key: "api",
      components: [],
    },
    {
      key: "conditional",
      components: [],
    },
    {
      key: "logic",
      components: [],
    },
  ],
};

const fodselsNummerDNummerSchema = (keyPostfix = "") => ({
  label: "Fødselsnummer / D-nummer",
  type: "fnrfield",
  key: `fodselsnummerDNummer${keyPostfix}`,
  fieldSize: "input--s",
  input: true,
  spellcheck: false,
  dataGridLabel: true,
  validateOn: "blur",
  validate: {
    custom: "valid = instance.validateFnr(input) ? true : 'Dette er ikke et gyldig fødselsnummer eller D-nummer';",
    required: true,
  },
});

const firstNameSchema = (keyPostfix = "") => ({
  label: "Fornavn",
  type: "textfield",
  key: `fornavn${keyPostfix}`,
  fieldSize: "input--xxl",
  input: true,
  dataGridLabel: true,
  clearOnHide: true,
  autocomplete: "given-name",
  validateOn: "blur",
  validate: {
    required: true,
  },
});

const surnameSchema = (keyPostfix = "") => ({
  label: "Etternavn",
  type: "textfield",
  key: `etternavn${keyPostfix}`,
  fieldSize: "input--xxl",
  input: true,
  dataGridLabel: true,
  clearOnHide: true,
  autocomplete: "family-name",
  validateOn: "blur",
  validate: {
    required: true,
  },
});

const personaliaSchema = (keyPostfix = "") => ({
  label: "Personalia",
  hideLabel: true,
  type: "container",
  key: "personalia",
  input: true,
  components: [fodselsNummerDNummerSchema(keyPostfix), firstNameSchema(keyPostfix), surnameSchema(keyPostfix)],
});

const coAdresseSchema = (keyPostfix = "") => ({
  label: "C/O",
  type: "textfield",
  key: `co${keyPostfix}`,
  fieldSize: "input--xxl",
  validate: {
    required: false,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

const vegadresseSchema = (keyPostfix = "") => ({
  label: "Vegadresse",
  type: "textfield",
  key: `vegadresse${keyPostfix}`,
  fieldSize: "input--xxl",
  autocomplete: "street-address",
  validate: {
    required: true,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

const postnummerSchema = (keyPostfix = "") => ({
  label: "Postnummer",
  type: "textfield",
  key: `postnr${keyPostfix}`,
  autocomplete: "postal-code",
  spellcheck: false,
  fieldSize: "input--xs",
  validate: {
    required: true,
    minLength: 4,
    maxLength: 4,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

const poststedSchema = (keyPostfix = "") => ({
  label: "Poststed",
  type: "textfield",
  key: `poststed${keyPostfix}`,
  autocomplete: "address-level2",
  fieldSize: "input--xxl",
  validate: {
    required: true,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

const norskVegadresseSchema = (keyPostfix = "") => ({
  legend: "Kontaktadresse",
  key: "navSkjemagruppeVegadresse",
  type: "navSkjemagruppe",
  label: "Kontaktadresse",
  input: false,
  tableView: false,
  components: [
    coAdresseSchema(sokerPostfix),
    vegadresseSchema(sokerPostfix),
    postnummerSchema(sokerPostfix),
    poststedSchema(sokerPostfix),
  ],
});

const utlandVegadressePostboksSchema = (keyPostfix = "") => ({
  label: "Gatenavn og husnummer, evt. postboks",
  type: "textfield",
  key: `utlandVegadressePostboks${keyPostfix}`,
  autocomplete: "street-address",
  fieldSize: "input--xxl",
  validate: {
    required: true,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

const utlandBygningSchema = (keyPostfix = "") => ({
  label: "Bygning",
  type: "textfield",
  key: `utlandBygning${keyPostfix}`,
  fieldSize: "input--xxl",
  validate: {
    required: false,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

const utlandPostkodeSchema = (keyPostfix = "") => ({
  label: "Postkode",
  type: "textfield",
  key: `utlandPostkode${keyPostfix}`,
  autocomplete: "postal-code",
  fieldSize: "input--s",
  validate: {
    required: false,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

const utlandByStedSchema = (keyPostfix = "") => ({
  label: "By / stedsnavn",
  type: "textfield",
  key: `utlandBySted${keyPostfix}`,
  autocomplete: "address-level2",
  fieldSize: "input--xxl",
  validate: {
    required: false,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

const utlandRegionSchema = (keyPostfix = "") => ({
  label: "Region",
  type: "textfield",
  key: `utlandRegion${keyPostfix}`,
  autocomplete: "address-level1",
  fieldSize: "input--xxl",
  validate: {
    required: false,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

const utlandLandSchema = (keyPostfix = "") => ({
  label: "Land",
  type: "textfield",
  key: `utlandLand${keyPostfix}`,
  autocomplete: "country-name",
  fieldSize: "input--xxl",
  validate: {
    required: true,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

const utenlandskAdresseSchema = (keyPostfix = "") => ({
  legend: "Utenlandsk kontaktadresse",
  key: `navSkjemagruppeUtland${keyPostfix}`,
  type: "navSkjemagruppe",
  label: "Utenlandsk kontaktadresse",
  input: false,
  tableView: false,
  components: [
    coAdresseSchema({ keyPostfix }),
    utlandVegadressePostboksSchema({ keyPostfix }),
    utlandBygningSchema({ keyPostfix }),
    utlandPostkodeSchema({ keyPostfix }),
    utlandByStedSchema({ keyPostfix }),
    utlandRegionSchema({ keyPostfix }),
    utlandLandSchema({ keyPostfix }),
  ],
});

const epostSchema = () => ({
  label: "E-post",
  type: "email",
  key: `epost`,
  fieldSize: "input--xxl",
  input: true,
  dataGridLabel: true,
  validateOn: "blur",
  autocomplete: "email",
  clearOnHide: true,
  spellcheck: false,
  validate: {
    required: true,
  },
});

const telefonSchema = (keyPostfix = "") => ({
  label: "Telefonnummer",
  type: "phoneNumber",
  key: `telefonnummer${keyPostfix}`,
  fieldSize: "input--s",
  input: true,
  dataGridLabel: true,
  inputMask: false,
  spellcheck: false,
  autocomplete: "tel",
  validateOn: "blur",
  clearOnHide: true,
  validate: {
    required: true,
  },
});

const statsborgerskapSchema = (keyPostfix = "") => ({
  label: "Statsborgerskap",
  type: "textfield",
  key: `statsborgerskap${keyPostfix}`,
  fieldSize: "input--xxl",
  input: true,
  dataGridLabel: true,
  validateOn: "blur",
  clearOnHide: true,
  validate: {
    required: true,
  },
});

const borDuINorgeSchema = (keyPostfix = "") => ({
  label: "Bor du i Norge?",
  type: "radiopanel",
  key: `borDuINorge${keyPostfix}`,
  input: true,
  validateOn: "blur",
  validate: {
    required: true,
  },
  values: [
    {
      value: "ja",
      label: "Ja",
    },
    {
      value: "nei",
      label: "Nei",
    },
  ],
});

const komplettKontaktInfoSchema = (keyPostfix = "") => ({
  label: "Komplett kontaktinfo",
  hideLabel: true,
  type: "container",
  key: `komplettKontaktinfo${keyPostfix}`,
  input: true,
  components: [
    {
      key: "harDuNorskFodselsnummerEllerDNummer",
      type: "radiopanel",
      input: true,
      validateOn: "blur",
      tableView: false,
      label: "Har du norsk fødselsnummer eller D-nummer?",
      values: [
        {
          value: "ja",
          label: "Ja",
        },
        {
          value: "nei",
          label: "Nei",
        },
      ],
      validate: {
        required: true,
      },
    },
    {
      label: "Fødselsnummer / D-nummer",
      key: "fodselsnummerDNummerSoker",
      type: "fnrfield",
      input: true,
      tableView: true,
      conditional: {
        show: true,
        when: "harDuNorskFodselsnummerEllerDNummer",
        eq: "ja",
      },
    },
    {
      visArvelger: true,
      label: "Fødselsdato (dd.mm.åååå)",
      mayBeEqual: false,
      key: "fodselsdatoDdMmAaaaSoker",
      type: "navDatepicker",
      dataGridLabel: true,
      input: true,
      tableView: false,
      validateOn: "blur",
      validate: {
        required: true,
        custom:
          "valid = instance.validateDatePicker(input, data,component.beforeDateInputKey, component.mayBeEqual, component.earliestAllowedDate, component.latestAllowedDate);",
      },
      conditional: {
        show: true,
        when: "harDuNorskFodselsnummerEllerDNummer",
        eq: "nei",
      },
    },
    {
      content:
        'NAV sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse. \n<br>\nDu kan <a href="https://www.skatteetaten.no/person/folkeregister/flytte/endre-postadresse/" target="_blank">sjekke og endre din folkeregistrerte adresse på skatteetatens nettsider (åpnes i et nytt vindu).</a>\nHvis du ønsker å motta kommunikasjon fra NAV på en annen adresse enn din folkeregistrerte adresse, kan du bruke lenken ovenfor til å oppgi en postadresse i Folkeregisteret.\nDu finner også papirskjema for å endre postadresse på samme siden hos Skatteetaten.',
      key: "alertstripe",
      type: "alertstripe",
      label: "Alertstripe",
      alerttype: "info",
      input: true,
      tableView: false,
      conditional: {
        show: true,
        when: "harDuNorskFodselsnummerEllerDNummer",
        eq: "ja",
      },
    },
    {
      label: "Bor du i Norge?",
      key: "borDuINorge",
      type: "radiopanel",
      input: true,
      tableView: false,
      validateOn: "blur",
      validate: {
        required: true,
      },
      values: [
        {
          value: "ja",
          label: "Ja",
        },
        {
          value: "nei",
          label: "Nei",
        },
      ],
      conditional: {
        show: true,
        when: "harDuNorskFodselsnummerEllerDNummer",
        eq: "nei",
      },
    },
    {
      label: "Er kontaktadressen din en vegadresse eller postboksadresse",
      key: "vegadresseEllerPostboksadresse",
      type: "radiopanel",
      input: true,
      validateOn: "blur",
      tableView: false,
      values: [
        {
          value: "vegadresse",
          label: "Vegadresse",
        },
        {
          value: "postboksadresse",
          label: "Postboksadresse",
        },
      ],
      validate: {
        required: true,
      },
      conditional: {
        show: true,
        when: "borDuINorge",
        eq: "ja",
      },
    },
    {
      legend: "Kontaktadresse",
      key: "navSkjemagruppeVegadresse",
      type: "navSkjemagruppe",
      label: "Kontaktadresse",
      input: false,
      tableView: false,
      conditional: {
        show: true,
        when: "vegadresseEllerPostboksadresse",
        eq: "vegadresse",
      },
      components: [
        {
          label: "C/O",
          fieldSize: "input--xxl",
          validateOn: "blur",
          key: "coSoker",
          type: "textfield",
          input: true,
          dataGridLabel: true,
          tableView: true,
        },
        {
          label: "Vegadresse",
          fieldSize: "input--xxl",
          autocomplete: "street-address",
          validateOn: "blur",
          key: "vegadresseSoker",
          type: "textfield",
          input: true,
          dataGridLabel: true,
          tableView: true,
          validate: {
            required: true,
          },
        },
        {
          label: "Husnummer (og evt. bokstav)",
          fieldSize: "input--xs",
          validateOn: "blur",
          key: "husnummerSoker",
          type: "textfield",
          input: true,
          dataGridLabel: true,
          tableView: true,
        },
        {
          label: "Postnummer",
          fieldSize: "input--xs",
          key: "postnrSoker",
          type: "textfield",
          input: true,
          dataGridLabel: true,
          tableView: true,
          autocomplete: "postal-code",
          spellcheck: false,
          validateOn: "blur",
          validate: {
            required: true,
            minLength: 4,
            maxLength: 4,
          },
        },
        {
          label: "Poststed",
          fieldSize: "input--xxl",
          key: "poststedSoker",
          type: "textfield",
          input: true,
          dataGridLabel: true,
          tableView: true,
          autocomplete: "address-level2",
          validateOn: "blur",
          validate: {
            required: true,
          },
        },
        {
          visArvelger: true,
          label: "Gyldig fra og med dato (dd.mm.åååå)",
          key: "gyldigFraDatoDdMmAaaa1",
          type: "navDatepicker",
          dataGridLabel: true,
          input: true,
          tableView: false,
          mayBeEqual: false,
          validateOn: "blur",
          validate: {
            required: true,
            custom:
              "valid = instance.validateDatePicker(input, data,component.beforeDateInputKey, component.mayBeEqual, component.earliestAllowedDate, component.latestAllowedDate);",
          },
        },
        {
          visArvelger: true,
          label: "Gyldig til og med dato (dd.mm.åååå)",
          key: "gyldigTilDatoDdMmAaaa1",
          type: "navDatepicker",
          dataGridLabel: true,
          input: true,
          tableView: false,
          latestAllowedDate: 365,
          description:
            "Du velger selv hvor lenge adressen skal være gyldig, maksimalt 1 år. Etter 1 år må du endre eller forlenge adressen.",
          beforeDateInputKey: "gyldigFraDatoDdMmAaaa1",
          mayBeEqual: false,
          validateOn: "blur",
          validate: {
            custom:
              "valid = instance.validateDatePicker(input, data,component.beforeDateInputKey, component.mayBeEqual, component.earliestAllowedDate, component.latestAllowedDate);",
          },
        },
      ],
    },
    {
      legend: "Kontaktadresse",
      key: "navSkjemagruppePostboksadresse",
      type: "navSkjemagruppe",
      label: "Kontaktadresse",
      input: false,
      tableView: false,
      conditional: {
        show: true,
        when: "vegadresseEllerPostboksadresse",
        eq: "postboksadresse",
      },
      components: [
        {
          label: "Navn på eier av postboksen",
          fieldSize: "input--xxl",
          validateOn: "blur",
          key: "navnPaEierAvPostboksenSoker",
          type: "textfield",
          input: true,
          dataGridLabel: true,
          tableView: true,
        },
        {
          label: "Postboks",
          fieldSize: "input--s",
          key: "postboksSoker",
          type: "textfield",
          input: true,
          dataGridLabel: true,
          tableView: true,
          validateOn: "blur",
          validate: {
            required: true,
          },
        },
        {
          label: "Postnummer",
          fieldSize: "input--xs",
          autocomplete: "postal-code",
          spellcheck: false,
          validateOn: "blur",
          validate: {
            required: true,
            minLength: 4,
            maxLength: 4,
          },
          key: "postboksPostnrSoker",
          type: "textfield",
          input: true,
          dataGridLabel: true,
          tableView: true,
        },
        {
          label: "Poststed",
          fieldSize: "input--xxl",
          autocomplete: "address-level2",
          validateOn: "blur",
          validate: {
            required: true,
          },
          key: "postboksPoststedSoker",
          type: "textfield",
          input: true,
          dataGridLabel: true,
          tableView: true,
        },
        {
          visArvelger: true,
          label: "Gyldig fra og med dato (dd.mm.åååå)",
          mayBeEqual: false,
          validate: {
            required: true,
            custom:
              "valid = instance.validateDatePicker(input, data,component.beforeDateInputKey, component.mayBeEqual, component.earliestAllowedDate, component.latestAllowedDate);",
          },
          validateOn: "blur",
          key: "gyldigFraDatoDdMmAaaa2",
          type: "navDatepicker",
          dataGridLabel: true,
          input: true,
          tableView: false,
        },
        {
          visArvelger: true,
          label: "Gyldig til og med dato (dd.mm.åååå)",
          description:
            "Du velger selv hvor lenge adressen skal være gyldig, maksimalt 1 år. Etter 1 år må du endre eller forlenge adressen.",
          beforeDateInputKey: "gyldigFraDatoDdMmAaaa2",
          mayBeEqual: false,
          validate: {
            custom:
              "valid = instance.validateDatePicker(input, data,component.beforeDateInputKey, component.mayBeEqual, component.earliestAllowedDate, component.latestAllowedDate);",
          },
          validateOn: "blur",
          key: "gyldigTilDatoDdMmAaaa2",
          type: "navDatepicker",
          dataGridLabel: true,
          input: true,
          tableView: false,
          latestAllowedDate: 365,
        },
      ],
    },
    {
      legend: "Utenlandsk kontaktadresse",
      key: "navSkjemagruppeUtland",
      type: "navSkjemagruppe",
      label: "Utenlandsk kontaktadresse",
      input: false,
      tableView: false,
      conditional: {
        show: true,
        when: "borDuINorge",
        eq: "nei",
      },
      components: [
        {
          label: "C/O",
          fieldSize: "input--xxl",
          validateOn: "blur",
          key: "utlandCoSoker",
          type: "textfield",
          input: true,
          dataGridLabel: true,
          tableView: true,
        },
        {
          label: "Gatenavn og husnummer, evt. postboks",
          fieldSize: "input--xxl",
          key: "utlandVegadresseOgHusnummerSoker",
          type: "textfield",
          input: true,
          dataGridLabel: true,
          tableView: true,
          autocomplete: "street-address",
          validateOn: "blur",
          validate: {
            required: true,
          },
        },
        {
          label: "Bygning",
          fieldSize: "input--xxl",
          validateOn: "blur",
          key: "utlandBygningSoker",
          type: "textfield",
          input: true,
          dataGridLabel: true,
          tableView: true,
        },
        {
          label: "Postkode",
          fieldSize: "input--s",
          validateOn: "blur",
          key: "utlandPostkodeSoker",
          type: "textfield",
          input: true,
          dataGridLabel: true,
          tableView: true,
        },
        {
          label: "By / stedsnavn",
          fieldSize: "input--xxl",
          validateOn: "blur",
          key: "utlandByStedSoker",
          type: "textfield",
          input: true,
          dataGridLabel: true,
          tableView: true,
        },
        {
          label: "Region",
          fieldSize: "input--xxl",
          validateOn: "blur",
          key: "utlandRegionSoker",
          type: "textfield",
          input: true,
          dataGridLabel: true,
          tableView: true,
        },
        {
          label: "Land",
          fieldSize: "input--xxl",
          key: "utlandLandSoker",
          type: "textfield",
          input: true,
          dataGridLabel: true,
          tableView: true,
          autocomplete: "country-name",
          validateOn: "blur",
          validate: {
            required: true,
          },
        },
        {
          visArvelger: true,
          label: "Gyldig fra og med dato (dd.mm.åååå)",
          key: "gyldigFraDatoDdMmAaaa",
          type: "navDatepicker",
          dataGridLabel: true,
          input: true,
          tableView: false,
          mayBeEqual: false,
          validateOn: "blur",
          validate: {
            required: true,
            custom:
              "valid = instance.validateDatePicker(input, data,component.beforeDateInputKey, component.mayBeEqual, component.earliestAllowedDate, component.latestAllowedDate);",
          },
        },
        {
          visArvelger: true,
          label: "Gyldig til og med dato (dd.mm.åååå)",
          key: "gyldigTilDatoDdMmAaaa",
          type: "navDatepicker",
          dataGridLabel: true,
          input: true,
          tableView: false,
          description:
            "Du velger selv hvor lenge adressen skal være gyldig, maksimalt 1 år. Etter 1 år må du endre eller forlenge adressen.",
          beforeDateInputKey: "gyldigFraDatoDdMmAaaa",
          mayBeEqual: false,
          validateOn: "blur",
          validate: {
            required: true,
            custom:
              "valid = instance.validateDatePicker(input, data,component.beforeDateInputKey, component.mayBeEqual, component.earliestAllowedDate, component.latestAllowedDate);",
          },
        },
      ],
    },
  ],
});

const builderPalett = {
  advanced: null,
  premium: null,
  person: {
    title: "Person",
    components: {
      personalia: {
        title: "Personalia",
        key: "personalia",
        icon: "user",
        weight: 0,
        schema: personaliaSchema(),
      },
      fnrfield: {
        title: "Fødselsnummer",
        group: "person",
        icon: "user",
        weight: 10,
        schema: fodselsNummerDNummerSchema(),
      },
      firstName: {
        title: "Fornavn",
        key: "fornavn",
        icon: "user",
        weight: 20,
        schema: firstNameSchema(),
      },
      surname: {
        title: "Etternavn",
        key: "etternavn",
        icon: "user",
        weight: 30,
        schema: surnameSchema(),
      },
      /* kontaktinfo: {
        title: "Kontaktinfo",
        key: "kontaktinfo",
        icon: "home",
        weight: 40,
        schema: kontaktInfoSchema(),
      },*/
      komplettKontaktInfo: {
        title: "Komplett kontaktinfo",
        key: "komplettKontaktinfo",
        icon: "home",
        weight: 40,
        schema: komplettKontaktInfoSchema(),
      },
      norskVegadresse: {
        title: "Norsk vegadresse",
        icon: "home",
        key: "norskVegadresse",
        weight: 40,
        schema: norskVegadresseSchema(),
      },
      /* norskPostboksadresse: {
        title: "Norsk postboksadresse",
        key: "norskPostboksadresse",
        icon: "home",
        weight: 40,
        schema: norskPostboksadresseSchema(),
      },*/
      utenlandskAdresse: {
        title: "Utenlandsk adresse",
        key: "utenlandskAdresse",
        icon: "home",
        weight: 40,
        schema: utenlandskAdresseSchema(),
      },
      streetAddress: {
        title: "Vegdresse",
        key: "vegadresse",
        icon: "home",
        weight: 50,
        schema: vegadresseSchema(),
      },
      postcode: {
        title: "Postnummer",
        key: "postnr",
        icon: "home",
        weight: 60,
        schema: postnummerSchema(),
      },
      city: {
        title: "Poststed",
        key: "poststed",
        icon: "home",
        weight: 70,
        schema: poststedSchema(),
      },
      land: {
        title: "Land",
        key: "land",
        icon: "home",
        weight: 70,
        schema: utlandLandSchema(),
      },
      email: {
        title: "E-post",
        key: "epost",
        icon: "at",
        weight: 80,
        schema: epostSchema(),
      },
      phoneNumber: {
        title: "Telefon",
        key: "telefonnummer",
        icon: "phone-square",
        weight: 90,
        schema: telefonSchema(),
      },
      citizenship: {
        title: "Statsborgerskap",
        key: "statsborgerskap",
        icon: "user",
        weight: 100,
        schema: statsborgerskapSchema(),
      },
    },
  },
  pengerOgKonto: {
    title: "Penger og konto",
    components: {
      currency: {
        title: "Beløp",
        key: "belop",
        icon: "dollar",
        schema: {
          label: "Beløp",
          type: "currency",
          key: "belop",
          fieldSize: "input--s",
          input: true,
          currency: "nok",
          spellcheck: false,
          dataGridLabel: true,
          clearOnHide: true,
          validateOn: "blur",
          validate: {
            required: true,
          },
        },
      },
      bankAccount: {
        title: "Kontonummer",
        key: "kontonummer",
        icon: "bank",
        schema: {
          label: "Kontonummer",
          type: "textfield",
          key: "kontoNummer",
          fieldSize: "input--s",
          input: true,
          dataGridLabel: true,
          spellcheck: false,
          validateOn: "blur",
          clearOnHide: true,
          validate: {
            required: true,
            maxLength: 11,
            minLength: 11,
          },
        },
      },
    },
  },
  organisasjon: {
    title: "Bedrift / organisasjon",
    components: {
      orgNr: {
        title: "Org.nr.",
        key: "orgNr",
        icon: "institution",
        schema: {
          label: "Organisasjonsnummer",
          type: "textfield",
          key: "orgNr",
          fieldSize: "input--s",
          input: true,
          dataGridLabel: true,
          spellcheck: false,
          validateOn: "blur",
          clearOnHide: true,
          validate: {
            required: true,
            maxLength: 9,
            minLength: 9,
          },
        },
      },
      Arbeidsgiver: {
        title: "Arbeidsgiver",
        key: "arbeidsgiver",
        icon: "institution",
        schema: {
          label: "Arbeidsgiver",
          type: "textfield",
          key: "arbeidsgiver",
          fieldSize: "input--xxl",
          input: true,
          dataGridLabel: true,
          validateOn: "blur",
          clearOnHide: true,
          validate: {
            required: true,
          },
        },
      },
    },
  },
  datoOgTid: {
    title: "Dato og tid",
    components: {
      datetime: null,
      datoVelger: {
        title: "Datovelger",
        group: "datoOgTid",
        icon: "calendar",
        input: true,
        schema: {
          type: "navDatepicker",
          label: "Dato (dd.mm.åååå)",
          dataGridLabel: true,
          validateOn: "blur",
          validate: {
            custom:
              "valid = instance.validateDatePicker(input, data," +
              "component.beforeDateInputKey, component.mayBeEqual, " +
              "component.earliestAllowedDate, component.latestAllowedDate);",
            required: true,
          },
        },
      },
      time: {
        title: "Klokke",
        key: "klokke",
        icon: "clock-o",
        weight: 20,
        schema: {
          label: "Tid",
          type: "time",
          key: "tid",
          fieldSize: "input--s",
          input: true,
          dataGridLabel: true,
          spellcheck: false,
          clearOnHide: true,
          validateOn: "blur",
          validate: {
            required: true,
          },
        },
      },
      day: {
        title: "Mnd / år",
        key: "manedAr",
        icon: "calendar",
        weight: 40,
        schema: {
          label: "Mnd / år",
          type: "day",
          key: "manedAr",
          input: true,
          dataGridLabel: true,
          clearOnHide: true,
          validateOn: "blur",
          validate: {
            required: true,
          },
          fields: {
            day: {
              fieldSize: "input--xs",
              required: false,
              hide: true,
            },
            month: {
              fieldSize: "input--s",
              type: "select",
              placeholder: "month",
              required: true,
            },
            year: {
              fieldSize: "input--s",
              type: "number",
              placeholder: "year",
              required: true,
            },
          },
        },
      },
    },
  },
  basic: {
    title: "Standard felter",
    default: false,
    components: {
      checkbox: null,
      radio: null,
      textArea: null,
      textfield: {
        title: "Tekstfelt",
        key: "textfield",
        icon: "terminal",
        schema: {
          label: "Tekstfelt",
          type: "textfield",
          key: "tekstfelt",
          input: true,
          clearOnHide: true,
          fieldSize: "input--xxl",
          dataGridLabel: true,
          validateOn: "blur",
          validate: {
            required: true,
          },
        },
      },
      textarea: {
        title: "Tekstområde",
        key: "textarea",
        icon: "font",
        schema: {
          label: "Tekstområde",
          type: "textarea",
          key: "textarea",
          fieldSize: "input--xxl",
          input: true,
          dataGridLabel: true,
          clearOnHide: true,
          validateOn: "blur",
          autoExpand: true,
          validate: {
            required: true,
          },
        },
      },
      number: {
        title: "Tall",
        key: "number",
        icon: "hashtag",
        schema: {
          label: "Tall",
          type: "number",
          key: "number",
          fieldSize: "input--m",
          input: true,
          dataGridLabel: true,
          spellcheck: false,
          clearOnHide: true,
          validateOn: "blur",
          validate: {
            required: true,
          },
        },
      },
      prosent: {
        title: "Prosent",
        key: "prosent",
        icon: "percent",
        schema: {
          label: "Prosent",
          type: "number",
          key: "prosent",
          input: true,
          spellcheck: false,
          clearOnHide: true,
          suffix: "%",
          fieldSize: "input--xs",
          validateOn: "blur",
          validate: {
            required: true,
            min: 0,
            max: 100,
          },
        },
      },
      password: {
        title: "Passord",
        key: "password",
        icon: "asterisk",
        schema: {
          label: "Passord",
          type: "password",
          key: "password",
          fieldSize: "input--xxl",
          input: true,
          spellcheck: false,
          clearOnHide: true,
        },
      },
      navCheckbox: {
        title: "Avkryssingsboks",
        key: "Avkryssingsboks",
        icon: "check-square",
        group: "basic",
        documentation: "",
        weight: 0,
        schema: {
          label: "Avkryssingsboks",
          type: "navCheckbox",
          key: "Avkryssingsboks",
          input: true,
          hideLabel: false,
          clearOnHide: true,
          validateOn: "blur",
          validate: {
            required: true,
          },
        },
      },
      selectboxes: {
        title: "Flervalg",
        key: "selectboxes",
        icon: "plus-square",
        schema: {
          label: "Flervalg",
          type: "selectboxes",
          key: "selectboxes",
          fieldSize: "input--xxl",
          input: true,
          isNavCheckboxPanel: true,
          clearOnHide: true,
          validateOn: "blur",
          validate: {
            required: true,
          },
        },
      },
      select: {
        title: "Nedtrekksmeny",
        key: "select",
        icon: "th-list",
        schema: {
          label: "Nedtrekksmeny",
          type: "select",
          key: "select",
          input: true,
          clearOnHide: true,
          validateOn: "blur",
          validate: {
            required: true,
          },
        },
      },
      radiopanel: {
        title: "Radiopanel",
        key: "radiopanel",
        icon: "dot-circle-o",
        documentation: "",
        weight: 0,
        schema: {
          label: "Radiopanel",
          type: "radiopanel",
          key: "radiopanel",
          input: true,
          hideLabel: false,
          clearOnHide: true,
          validateOn: "blur",
          validate: {
            required: true,
          },
          values: [
            {
              value: "ja",
              label: "Ja",
            },
            {
              value: "nei",
              label: "Nei",
            },
          ],
        },
      },
      vedlegg: {
        title: "Vedlegg",
        key: "vedlegg",
        icon: "file",
        schema: {
          label: "< Navn på vedlegg > + husk å legge inn Gosys vedleggstittel og vedleggskode under API-fanen",
          type: "radiopanel",
          key: "vedlegg",
          input: true,
          clearOnHide: true,
          validateOn: "blur",
          validate: {
            required: true,
          },
          properties: {
            vedleggstittel: " ",
            vedleggskode: " ",
          },
          values: [
            {
              value: "leggerVedNaa",
              label: "Jeg legger det ved denne søknaden (anbefalt)",
            },
            {
              value: "ettersender",
              label:
                "Jeg ettersender dokumentasjonen senere (jeg er klar over at NAV ikke kan behandle søknaden før jeg har levert dokumentasjonen)",
            },
            {
              value: "levertTidligere",
              label: "Jeg har levert denne dokumentasjonen tidligere",
            },
          ],
        },
      },
      url: {
        title: "Nettsted",
        key: "url",
        icon: "link",
        schema: {
          label: "Nettsted",
          type: "url",
          key: "url",
          fieldSize: "input--xxl",
          input: true,
          clearOnHide: true,
          validateOn: "blur",
        },
      },
      tags: {
        title: "Stikkord",
        key: "tags",
        icon: "tags",
        schema: {
          label: "Stikkord",
          type: "tags",
          key: "tags",
          fieldSize: "input--xxl",
          input: true,
          clearOnHide: true,
          validateOn: "blur",
        },
      },
      signature: {
        title: "Underskrift",
        key: "signature",
        icon: "pencil-square-o",
        schema: {
          label: "Underskrift",
          type: "signature",
          key: "signature",
          input: true,
          clearOnHide: true,
          validateOn: "blur",
          footer: " ", // Trenger en blank space for å unngå at det kommer inn default 'sign above' tekst i dette feltet.
        },
      },
      survey: {
        title: "Spørreskjema",
        key: "survey",
        icon: "clipboard",
        schema: {
          label: "Spørreskjema",
          type: "survey",
          key: "survey",
          input: true,
          clearOnHide: true,
          validateOn: "blur",
        },
      },
    },
  },
  layout: {
    title: "Layout",
    components: {
      well: null,
      content: null,
      alertstripe: {
        title: "Alertstripe",
        key: "alertstripe",
        icon: "clipboard",
        weight: 2,
        group: "layout",
        documentation: "/userguide/#htmlelement",
        schema: {
          label: "Alertstripe",
          type: "alertstripe",
          key: "alertstripe",
          alerttype: "info",
          input: true,
          clearOnHide: true,
        },
      },
      fieldset: {
        ignore: true,
      },
      navSkjemagruppe: {
        documentation: "",
        group: "layout",
        icon: "th-large",
        key: "navSkjemagruppe",
        title: "Skjemagruppe",
        weight: 20,
        schema: {
          label: "Skjemagruppe",
          key: "navSkjemagruppe",
          type: "navSkjemagruppe",
          legend: "Skjemagruppe",
          components: [],
          input: false,
          persistent: false,
        },
      },
    },
  },
  data: {
    title: "Data",
    components: {
      datagrid: {
        ignore: true,
      },
      editgrid: {
        ignore: true,
      },
      datamap: null,
      tree: null,
      navDataGrid: {
        title: "Data Grid",
        icon: "th",
        group: "data",
        documentation: "/userguide/#datagrid",
        key: "datagrid",
        weight: 30,
        schema: {
          label: "Data Grid",
          key: "datagrid",
          type: "datagrid",
          clearOnHide: true,
          input: true,
          isNavDataGrid: true,
          tree: true,
          components: [],
        },
      },
    },
  },
};

export const FormBuilderSchemas = {
  fodselsNummerDNummerSchema,
  firstNameSchema,
  surnameSchema,
  personaliaSchema,
  vegadresseSchema,
  postnummerSchema,
  //utenlandskPostkodeSchema,
  poststedSchema,
  utlandLandSchema,
  epostSchema,
  telefonSchema,
  statsborgerskapSchema,
  borDuINorgeSchema,
  //kontaktInfoSchema,
};

const FormBuilderOptions = {
  builder: builderPalett,
  editForm: builderEditForm,
  language: "nb-NO",
  sanitizeConfig: SANITIZE_CONFIG,
};

export default FormBuilderOptions;
