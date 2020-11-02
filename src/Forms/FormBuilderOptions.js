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
  validate: {
    required: true,
  },
};

const surnameSchema = {
  label: "Etternavn",
  type: "textfield",
  key: "etternavn",
  input: true,
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
  validate: {
    required: true,
    maxLength: 4,
    minLength: 4,
  },
};

const poststedSchema = {
  label: "Poststed",
  type: "textfield",
  key: "poststed",
  input: true,
  validateOn: "blur",
  validate: {
    required: true,
  },
};

const landSchema = {};

const epostSchema = {
  label: "E-post",
  type: "email",
  key: "email",
  input: true,
  validate: {
    required: true,
  },
};

const telefonSchema = {
  label: "Telefonnummer",
  type: "phoneNumber",
  key: "phoneNumber",
  input: true,
  inputMask: false,
  spellcheck: false,
  validateOn: "blur",
  validate: {
    required: true,
    pattern: "",
  },
};

const statsborgerskapSchema = {
  label: "Statsborgerskap",
  type: "textfield",
  key: "textfield",
  input: true,
  validateOn: "blur",
  validate: {
    required: true,
  },
};

const kontaktinfoSchema = {
  label: "Kontaktinfo",
  hideLabel: true,
  type: "container",
  key: "kontaktinfo",
  input: true,
  components: [gateadresseSchema, postnrSchema, poststedSchema, epostSchema, telefonSchema],
};

const builderPalett = {
  person: {
    title: "Person",
    components: {
      adresse: {
        title: "Kontaktinfo",
        key: "kontaktinfo",
        icon: "home",
        schema: kontaktinfoSchema,
      },
      personalia: {
        title: "Personalia",
        key: "personalia",
        icon: "user",
        schema: personaliaSchema,
      },
      firstName: {
        title: "Fornavn",
        key: "fornavn",
        icon: "user",
        schema: firstNameSchema,
      },
      surname: {
        title: "Etternavn",
        key: "etternavn",
        icon: "user",
        schema: surnameSchema,
      },
      streetAddress: {
        title: "Gatedresse",
        key: "gateadresse",
        icon: "home",
        schema: gateadresseSchema,
      },
      postcode: {
        title: "Postnummer",
        key: "postnr",
        icon: "home",
        schema: postnrSchema,
      },
      city: {
        title: "Poststed",
        key: "poststed",
        icon: "home",
        schema: poststedSchema,
      },
      email: {
        title: "E-post",
        key: "email",
        icon: "at",
        schema: epostSchema,
      },
      phoneNumber: {
        title: "Telefon",
        key: "phoneNumber",
        icon: "phone-square",
        schema: telefonSchema,
      },
      citizenship: {
        title: "Statsborgerskap",
        key: "textfield",
        icon: "user",
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
        },
      },
      bankAccount: {
        title: "Kontonummer",
        key: "textfield",
        icon: "bank",
        schema: {
          label: "Kontonummer",
          type: "textfield",
          key: "textfield",
          input: true,
          spellcheck: false,
          validateOn: "blur",
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
      time: {
        title: "Tid",
        key: "time",
        icon: "clock-o",
        schema: {
          label: "Tid",
          type: "time",
          key: "time",
          input: true,
          spellcheck: false,
        },
      },
      datetime: {
        title: "Dato / tid",
        key: "datetime",
        icon: "calendar",
        schema: {
          label: "Dato / tid",
          type: "datetime",
          key: "datetime",
          input: true,
          spellcheck: false,
        },
      },
      day: {
        title: "Dag / mnd / år",
        key: "day",
        icon: "calendar",
        schema: {
          label: "Dag / mnd / år",
          type: "day",
          key: "day",
          input: true,
        },
      },
      month: {
        title: "Måned",
        key: "month",
        icon: "calendar",
        schema: {
          label: "Måned",
          type: "datetime",
          key: "month",
          input: true,
          datePicker: {
            showWeeks: true,
            startingDay: 0,
            initDate: "",
            minMode: "month",
            maxMode: "year",
            yearRows: 4,
            yearColumns: 5,
            minDate: null,
            maxDate: null,
            datepickerMode: "month",
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
          key: "textfield",
          input: true,
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
          validate: {
            required: true,
          },
        },
      },
      button: {
        title: "Knapp",
        key: "button",
        icon: "stop",
        schema: {
          label: "Knapp",
          type: "button",
          key: "button",
          input: true,
        },
      },
      url: {
        title: "Lenke",
        key: "url",
        icon: "link",
        schema: {
          label: "Lenke",
          type: "url",
          key: "url",
          input: true,
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
