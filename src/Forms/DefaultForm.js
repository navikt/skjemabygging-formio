import { kontaktinfoSchema } from "./FormBuilderOptions";
import { personaliaSchema } from "./FormBuilderOptions";
import { statsborgerskapSchema } from "./FormBuilderOptions";

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
      {
        Label: "Fødselsnummer / D-nummer",
        type: "fnrfield",
        key: "fodselsnummerDNummerSoker",
        input: true,
        validate: {
          required: true,
        },
      },
      {
        label: "Fornavn",
        type: "textfield",
        key: "fornavnSoker",
        input: true,
        validate: {
          required: true,
        },
      },
      {
        label: "Etternavn",
        type: "textfield",
        key: "etternavnSoker",
        input: true,
        validate: {
          required: true,
        },
      },
      {
        label: "Bor du i Norge?",
        type: "radio",
        key: "borDuINorgeSoker",
        input: true,
        validateOn: "blur",
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
        label: "Gateadresse",
        type: "textfield",
        key: "gateadresseSoker",
        input: true,
        validateOn: "blur",
        validate: {
          required: true,
        },
      },
      {
        label: "Postnummer",
        type: "textfield",
        key: "postnrSoker",
        input: true,
        spellcheck: false,
        validateOn: "blur",
        validate: {
          required: true,
          maxLength: 4,
          minLength: 4,
        },
        conditional: {
          show: false,
          when: "borDuINorgeSoker",
          eq: "nei",
        },
      },
      {
        label: "Utenlandsk postkode",
        type: "textfield",
        key: "utenlandskPostkodeSoker",
        input: true,
        validateOn: "blur",
        clearOnHide: true,
        validate: {
          required: false,
        },
        conditional: {
          show: true,
          when: "borDuINorgeSoker",
          eq: "nei",
        },
      },
      {
        label: "Poststed",
        type: "textfield",
        key: "poststedSoker",
        input: true,
        validateOn: "blur",
        validate: {
          required: true,
        },
      },
      {
        label: "Land",
        type: "textfield",
        key: "landSoker",
        input: true,
        validateOn: "blur",
        clearOnHide: true,
        validate: {
          required: true,
        },
        conditional: {
          show: true,
          when: "borDuINorgeSoker",
          eq: "nei",
        },
      },
      {
        label: "E-post",
        type: "email",
        key: "emailSoker",
        input: true,
        validate: {
          required: true,
        },
      },
      {
        label: "Telefonnummer",
        type: "phoneNumber",
        key: "phoneNumberSoker",
        input: true,
        inputMask: false,
        spellcheck: false,
        validateOn: "blur",
        validate: {
          required: true,
        },
      },
    ],
  },
];
