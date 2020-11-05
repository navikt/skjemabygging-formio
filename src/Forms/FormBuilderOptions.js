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

export const personaliaSchema = {
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

const epostSchema = {
  label: "E-post",
  type: "email",
  key: "epost",
  input: true,
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
  validate: {
    required: true,
  },
};

export const statsborgerskapSchema = {
  label: "Statsborgerskap",
  type: "textfield",
  key: "statsborgerskap",
  input: true,
  validateOn: "blur",
  validate: {
    required: true,
  },
};

export const kontaktinfoSchema = {
  label: "Kontaktinfo",
  hideLabel: true,
  type: "container",
  key: "kontaktinfo",
  input: true,
  components: [gateadresseSchema, postnrSchema, poststedSchema, epostSchema, telefonSchema],
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
        schema: kontaktinfoSchema,
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
        key: "tid",
        icon: "clock-o",
        weight: 20,
        schema: {
          label: "Tid",
          type: "time",
          key: "tid",
          input: true,
          spellcheck: false,
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
        },
      },
      month: {
        title: "Måned",
        key: "maaned",
        icon: "calendar",
        weight: 50,
        schema: {
          label: "Måned",
          type: "datetime",
          key: "maaned",
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
          label: "< Navn på vedlegg > + husk å legge inn vedleggskode i API property name (eks: vedleggD9)",
          type: "radio",
          key: "vedlegg",
          input: true,
          validate: {
            required: true,
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
