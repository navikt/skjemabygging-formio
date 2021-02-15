import {
  fodselsNummerDNummerSchema,
  firstNameSchema,
  surnameSchema,
  borDuINorgeSchema,
  gateadresseSchema,
  postnrSchema,
  poststedSchema,
  landSchema,
  epostSchema,
  telefonSchema,
  utenlandskPostkodeSchema,
} from "./FormBuilderOptions";

const sokerPostfix = "Soker";

export const defaultFormFields = () => [
  {
    type: "panel",
    input: false,
    title: "Introduksjon",
    theme: "default",
    components: [
      {
        label: "Introduksjonstekst",
        type: "content",
        key: "introduksjonstekst",
        input: false,
        html: "Her skal det stå litt informasjon om søknaden",
      },
    ],
  },
  {
    type: "panel",
    input: false,
    title: "Personinformasjon",
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
      epostSchema(sokerPostfix),
      telefonSchema(sokerPostfix),
    ],
  },
];
