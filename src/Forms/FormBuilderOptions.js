import { alleVerdensLand } from "./data/AlleVerdensLand";

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

const firstNameSchema = {
  label: "Fornavn",
  type: "textfield",
  key: "fornavn",
  input: true,
  clearOnHide: true,
  validate: {
    required: true,
  },
};

const surnameSchema = {
  label: "Etternavn",
  type: "textfield",
  key: "etternavn",
  input: true,
  clearOnHide: true,
  validate: {
    required: true,
  },
};

const personaliaSchema = {
  label: "Personalia", // not used
  hideLabel: true,
  type: "container",
  key: "personalia", // er denne viktig?
  input: true, // er denne viktig??
  components: [
    // denne er kjempeviktig
    {
      key: "fodselsnummerDNummer", // er denne viktig?
      type: "fnrfield",
    },
    firstNameSchema,
    surnameSchema,
  ],
};

const gateadresseSchema = {
  label: "Gateadresse",
  type: "textfield",
  key: "gateadresse",
  input: true,
  validateOn: "blur",
  clearOnHide: true,
  validate: {
    required: true,
  },
};

const postnrSchema = {
  label: "Postnummer",
  type: "textfield",
  key: "postnr",
  input: true,
  spellcheck: false,
  validateOn: "blur",
  clearOnHide: true,
  validate: {
    required: true,
    maxLength: 4,
    minLength: 4,
  },
};

const utenlandskPostkodeSchema = {
  label: "Utenlandsk postkode",
  type: "textfield",
  key: "utenlandskPostkode",
  input: true,
  spellcheck: false,
  validateOn: "blur",
  clearOnHide: true,
};

const poststedSchema = {
  label: "Poststed",
  type: "textfield",
  key: "poststed",
  input: true,
  clearOnHide: true,
  validateOn: "blur",
  validate: {
    required: true,
  },
};

const landSchema = {
  label: "Land",
  type: "select",
  key: "land",
  input: true,
  validateOn: "blur",
  clearOnHide: true,
  validate: {
    required: true,
  },
  data: {
    values: alleVerdensLand.map((land) => ({ value: land.code, label: land.name })),
  },
};

const epostSchema = {
  label: "E-post",
  type: "email",
  key: "epost",
  input: true,
  validateOn: "blur",
  clearOnHide: true,
  validate: {
    required: true,
  },
};

const telefonSchema = {
  label: "Telefonnummer",
  type: "phoneNumber",
  key: "telefonnumer",
  input: true,
  inputMask: false,
  spellcheck: false,
  validateOn: "blur",
  clearOnHide: true,
  validate: {
    required: true,
  },
};

const statsborgerskapSchema = {
  label: "Statsborgerskap",
  type: "select",
  key: "statsborgerskap",
  input: true,
  validateOn: "blur",
  clearOnHide: true,
  validate: {
    required: true,
  },
  data: {
    values: alleVerdensLand.map((land) => ({ value: land.code, label: land.name })),
  },
};

const kontaktInfoSchema = {
  label: "Kontaktinfo",
  hideLabel: true,
  type: "container",
  key: "kontaktinfo",
  input: true,
  components: [
    {
      label: "Bor du i Norge?",
      type: "radio",
      key: "borDuINorge",
      input: true,
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
    gateadresseSchema,
    {
      ...postnrSchema,
      conditional: {
        show: false,
        when: "borDuINorge",
        eq: "nei",
      },
    },
    {
      ...utenlandskPostkodeSchema,
      conditional: {
        show: true,
        when: "borDuINorge",
        eq: "nei",
      },
    },
    poststedSchema,
    {
      ...landSchema,
      conditional: {
        show: true,
        when: "borDuINorge",
        eq: "nei",
      },
    },
    epostSchema,
    telefonSchema,
  ],
};

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
        schema: personaliaSchema,
      },
      firstName: {
        title: "Fornavn",
        key: "fornavn",
        icon: "user",
        weight: 20,
        schema: firstNameSchema,
      },
      surname: {
        title: "Etternavn",
        key: "etternavn",
        icon: "user",
        weight: 30,
        schema: surnameSchema,
      },
      kontaktinfo: {
        title: "Kontaktinfo",
        key: "kontaktinfo",
        icon: "home",
        weight: 40,
        schema: kontaktInfoSchema,
      },
      streetAddress: {
        title: "Gatedresse",
        key: "gateadresse",
        icon: "home",
        weight: 50,
        schema: gateadresseSchema,
      },
      postcode: {
        title: "Postnummer",
        key: "postnr",
        icon: "home",
        weight: 60,
        schema: postnrSchema,
      },
      city: {
        title: "Poststed",
        key: "poststed",
        icon: "home",
        weight: 70,
        schema: poststedSchema,
      },
      land: {
        title: "Land",
        key: "land",
        icon: "home",
        weight: 70,
        schema: landSchema,
      },
      email: {
        title: "E-post",
        key: "epost",
        icon: "at",
        weight: 80,
        schema: epostSchema,
      },
      phoneNumber: {
        title: "Telefon",
        key: "telefonnummer",
        icon: "phone-square",
        weight: 90,
        schema: telefonSchema,
      },
      citizenship: {
        title: "Statsborgerskap",
        key: "statsborgerskap",
        icon: "user",
        weight: 100,
        schema: statsborgerskapSchema,
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
          input: true,
          currency: "nok",
          spellcheck: false,
          clearOnHide: true,
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
          input: true,
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
          input: true,
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
          input: true,
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
      datoVelger: {
        title: "Datovelger",
        group: "datoOgTid",
        icon: "calendar",
        input: true,
        schema: {
          type: "navDatepicker",
          label: "Dato (dd.mm.åååå)",
          validateOn: "blur",
          validate: {
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
          input: true,
          spellcheck: false,
          clearOnHide: true,
          validate: {
            required: true,
          },
        },
      },
      datetime: {
        title: "Dato / tid",
        key: "datoTid",
        icon: "calendar",
        weight: 30,
        schema: {
          label: "Dato / tid",
          type: "datetime",
          key: "datoTid",
          input: true,
          spellcheck: false,
          clearOnHide: true,
          validate: {
            required: true,
          },
        },
      },
      day: {
        title: "Dag / mnd / år",
        key: "dagMndAr",
        icon: "calendar",
        weight: 40,
        schema: {
          label: "Dag / mnd / år",
          type: "day",
          key: "dagMndAr",
          input: true,
          clearOnHide: true,
          validate: {
            required: true,
          },
        },
      },
    },
  },
  basic: {
    title: "Standard felter",
    default: false,
    components: {
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
          input: true,
          clearOnHide: true,
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
          input: true,
          spellcheck: false,
          clearOnHide: true,
          validate: {
            required: true,
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
          input: true,
          spellcheck: false,
          clearOnHide: true,
        },
      },
      checkbox: {
        title: "Avkryssingsboks",
        key: "checkbox",
        icon: "check-square",
        schema: {
          label: "Avkryssingsboks",
          type: "checkbox",
          key: "checkbox",
          input: true,
          clearOnHide: true,
          validate: {
            required: true,
          },
        },
      },
      checkboxDesignSystem: {
        title: "Design-Avkryssingsboks",
        key: "AvkryssingsboksNy",
        icon: "check-square",
        schema: {
          label: "AvkryssingsboksNy",
          type: "navCheckbox",
          key: "avkryssingsboksNy",
          input: true,
          hideLabel: true,
          clearOnHide: true,
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
          input: true,
          clearOnHide: true,
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
          validate: {
            required: true,
          },
        },
      },
      radio: {
        title: "Radioknapp",
        key: "radio",
        icon: "dot-circle-o",
        schema: {
          label: "Radioknapp",
          type: "radio",
          key: "radio",
          input: true,
          clearOnHide: true,
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
      radiopanel: {
        title: "Radiopanel",
        key: "radiopanel",
        icon: "dot-circle-o",
        schema: {
          label: "Radiopanel",
          type: "radiopanel",
          key: "radiopanel",
          input: true,
          hideLabel: true,
          clearOnHide: true,
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
          type: "radio",
          key: "vedlegg",
          input: true,
          clearOnHide: true,
          validate: {
            required: true,
          },
          properties: {
            vedleggstittel: " ",
            vedleggskode: " ",
          },
          values: [
            {
              value: "jegLeggerDetVedDenneSøknaden",
              label: "Jeg legger det ved denne søknaden (anbefalt)",
            },
            {
              value: "jegEttersenderDokumentasjonenSenere",
              label:
                "Jeg ettersender dokumentasjonen senere (jeg er klar over at NAV ikke kan behandle søknaden før jeg har levert dokumentasjonen)",
            },
            {
              value: "jegHarLevertDenneDokumentasjonenTidligere",
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
          input: true,
          clearOnHide: true,
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
          input: true,
          clearOnHide: true,
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
        },
      },
    },
  },
};

export default {
  builder: builderPalett,
  editForm: builderEditForm,
  language: "nb-NO",
};
