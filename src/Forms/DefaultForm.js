import {
  fodselsNummerDNummerSchema,
  firstNameSchema,
  surnameSchema,
  borDuINorgeSchema,
  gateadresseSchema,
  postnrSchema,
  poststedSchema,
  landSchema,
  telefonSchema,
  utenlandskPostkodeSchema,
} from "./FormBuilderOptions";

const sokerPostfix = "Soker";

export const defaultFormFields = () => [
  {
    type: "panel",
    input: false,
    title: "Veiledning",
    theme: "default",
    components: [
      {
        label: "Veiledningstekst",
        type: "content",
        key: "veiledningstekst",
        input: false,
        html: "Her skal det stå litt informasjon om søknaden",
      },
    ],
  },
  {
    type: "panel",
    input: false,
    title: "Dine opplysninger",
    theme: "default",
    components: [
      fodselsNummerDNummerSchema(sokerPostfix),
      firstNameSchema(sokerPostfix),
      surnameSchema(sokerPostfix),
      borDuINorgeSchema(sokerPostfix),
      gateadresseSchema(sokerPostfix),
      {
        ...postnrSchema(sokerPostfix),
        conditional: {
          show: false,
          when: borDuINorgeSchema(sokerPostfix).key,
          eq: "nei",
        },
      },
      {
        ...utenlandskPostkodeSchema(sokerPostfix),
        conditional: {
          show: true,
          when: borDuINorgeSchema(sokerPostfix).key,
          eq: "nei",
        },
      },
      poststedSchema(sokerPostfix),
      {
        ...landSchema(sokerPostfix),
        conditional: {
          show: true,
          when: borDuINorgeSchema(sokerPostfix).key,
          eq: "nei",
        },
      },
      telefonSchema(sokerPostfix),
    ],
  },
  {
    type: "panel",
    input: false,
    title: "Vedlegg",
    theme: "default",
    components: [
      {
        label: "Har du noen tilleggsdokumentasjon du ønsker å legge ved?",
        type: "radiopanel",
        key: "vedlegg",
        input: true,
        clearOnHide: true,
        validate: {
          required: true,
        },
        properties: {
          vedleggstittel: "Annet",
          vedleggskode: "N6",
        },
        values: [
          {
            value: "leggerVedNaa",
            label: "Ja, jeg legger det ved denne søknaden (anbefalt)",
          },
          {
            value: "ettersender",
            label:
              "Jeg ettersender dokumentasjonen senere (jeg er klar over at NAV ikke kan behandle søknaden før jeg har levert dokumentasjonen)",
          },
          {
            value: "neiJegHarIngenEkstraDokumentasjonJegVilLeggeVed",
            label: "Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved",
          },
        ],
      },
    ],
  },
];
