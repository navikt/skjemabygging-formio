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

const builderPalett = {
  advanced: {
    title: "Tilpassede felter",
    components: {
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
        schema: {
          label: "Gateadresse",
          type: "textfield",
          key: "gateadresse",
          input: true,
          validate: {
            required: true,
          },
        },
      },
      postcode: {
        title: "Postnummer",
        key: "postnr",
        icon: "home",
        schema: {
          label: "Postnummer, 4 siffer",
          type: "textfield",
          key: "postnr",
          input: true,
          inputMask: "9999",
          validateOn: "blur",
          validate: {
            required: true,
          },
        },
      },
      city: {
        title: "Poststed",
        key: "poststed",
        icon: "home",
        schema: {
          label: "Poststed",
          type: "textfield",
          key: "poststed",
          input: true,
          validate: {
            required: true,
          },
        },
      },
      email: {
        title: "E-post",
        key: "email",
        icon: "at",
        schema: {
          label: "E-post",
          type: "email",
          key: "email",
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
      phoneNumber: {
        title: "Telefon",
        key: "phoneNumber",
        icon: "phone-square",
        schema: {
          label: "Telefonnummer, 8 siffer",
          type: "phoneNumber",
          key: "phoneNumber",
          input: true,
          inputMask: "99 99 99 99",
          validateOn: "blur",
          prefix: "+47",
          validate: {
            required: true,
            pattern: "",
          },
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
        },
      },
      orgNr: {
        title: "Org.nr.",
        key: "orgNr",
        icon: "institution",
        schema: {
          label: "Organisasjonsnummer, 9 siffer",
          type: "textfield",
          key: "orgNr",
          input: true,
          inputMask: "999 999 999",
          validateOn: "blur",
          validate: {
            required: true,
          },
        },
      },
      address: {
        title: "Adresse",
        key: "address",
        icon: "home",
        schema: {
          label: "Adresse",
          type: "address",
          key: "address",
          input: true,
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
      time: {
        title: "Tid",
        key: "time",
        icon: "clock-o",
        schema: {
          label: "Tid",
          type: "time",
          key: "time",
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
      citizenship: {
        title: "Statsborgerskap",
        key: "textfield",
        icon: "user",
        schema: {
          label: "Statsborgerskap",
          type: "textfield",
          key: "textfield",
          input: true,
          validate: {
            required: true,
          },
        },
      },
      bankAccount: {
        title: "Kontonummer",
        key: "textfield",
        icon: "bank",
        schema: {
          label: "Kontonummer, 11 siffer",
          type: "textfield",
          key: "textfield",
          input: true,
          inputMask: "9999 9999 999",
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
          key: "textfield",
          input: true,
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
    },
  },
};

export default {
  builder: builderPalett,
  editForm: builderEditForm,
  language: "nb-NO",
};
