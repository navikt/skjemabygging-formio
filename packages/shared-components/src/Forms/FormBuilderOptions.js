import { SANITIZE_CONFIG } from "../template/sanitizeConfig";

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
  label: "Personalia", // not used
  hideLabel: true,
  type: "container",
  key: "personalia", // er denne viktig?
  input: true, // er denne viktig??
  components: [
    // denne er kjempeviktig
    fodselsNummerDNummerSchema(keyPostfix),
    firstNameSchema(keyPostfix),
    surnameSchema(keyPostfix),
  ],
});

const gateadresseSchema = (keyPostfix = "") => ({
  label: "Gateadresse",
  type: "textfield",
  key: `gateadresse${keyPostfix}`,
  fieldSize: "input--xxl",
  input: true,
  dataGridLabel: true,
  validateOn: "blur",
  autocomplete: "street-address",
  clearOnHide: true,
  validate: {
    required: true,
  },
});

const postnrSchema = (keyPostfix = "") => ({
  label: "Postnummer",
  type: "textfield",
  key: `postnr${keyPostfix}`,
  fieldSize: "input--xs",
  input: true,
  dataGridLabel: true,
  spellcheck: false,
  validateOn: "blur",
  autocomplete: "postal-code",
  clearOnHide: true,
  validate: {
    required: true,
    maxLength: 4,
    minLength: 4,
  },
});

const utenlandskPostkodeSchema = (keyPostfix = "") => ({
  label: "Utenlandsk postkode",
  type: "textfield",
  key: `utenlandskPostkode${keyPostfix}`,
  fieldSize: "input--m",
  input: true,
  dataGridLabel: true,
  spellcheck: false,
  autocomplete: "postal-code",
  validateOn: "blur",
  clearOnHide: true,
  validate: {
    required: false,
  },
});

const poststedSchema = (keyPostfix = "") => ({
  label: "Poststed",
  type: "textfield",
  key: `poststed${keyPostfix}`,
  fieldSize: "input--xxl",
  input: true,
  dataGridLabel: true,
  clearOnHide: true,
  autocomplete: "address-level2",
  validateOn: "blur",
  validate: {
    required: true,
  },
});

const landSchema = (keyPostfix = "") => ({
  label: "Land",
  type: "textfield",
  key: `land${keyPostfix}`,
  fieldSize: "input--xxl",
  input: true,
  dataGridLabel: true,
  autocomplete: "country-name",
  validateOn: "blur",
  clearOnHide: true,
  validate: {
    required: true,
  },
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

const kontaktInfoSchema = (keyPostfix = "") => ({
  label: "Kontaktinfo",
  hideLabel: true,
  type: "container",
  key: `kontaktinfo${keyPostfix}`,
  input: true,
  components: [
    borDuINorgeSchema(keyPostfix),
    gateadresseSchema(keyPostfix),
    {
      ...postnrSchema(keyPostfix),
      conditional: {
        show: false,
        when: borDuINorgeSchema(keyPostfix).key,
        eq: "nei",
      },
    },
    {
      ...utenlandskPostkodeSchema(keyPostfix),
      conditional: {
        show: true,
        when: borDuINorgeSchema(keyPostfix).key,
        eq: "nei",
      },
    },
    poststedSchema(keyPostfix),
    {
      ...landSchema(keyPostfix),
      conditional: {
        show: true,
        when: borDuINorgeSchema(keyPostfix).key,
        eq: "nei",
      },
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
      kontaktinfo: {
        title: "Kontaktinfo",
        key: "kontaktinfo",
        icon: "home",
        weight: 40,
        schema: kontaktInfoSchema(),
      },
      streetAddress: {
        title: "Gatedresse",
        key: "gateadresse",
        icon: "home",
        weight: 50,
        schema: gateadresseSchema(),
      },
      postcode: {
        title: "Postnummer",
        key: "postnr",
        icon: "home",
        weight: 60,
        schema: postnrSchema(),
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
        schema: landSchema(),
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
            custom: "valid = instance.validateDatePicker(input, data," +
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
              placeholder: "Måned",
              required: true,
            },
            year: {
              fieldSize: "input--xs",
              type: "number",
              placeholder: "År",
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
  gateadresseSchema,
  postnrSchema,
  utenlandskPostkodeSchema,
  poststedSchema,
  landSchema,
  epostSchema,
  telefonSchema,
  statsborgerskapSchema,
  borDuINorgeSchema,
  kontaktInfoSchema,
};

export default {
  builder: builderPalett,
  editForm: builderEditForm,
  language: "nb-NO",
  sanitizeConfig: SANITIZE_CONFIG,
};
