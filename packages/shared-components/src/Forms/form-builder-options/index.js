import { SANITIZE_CONFIG } from "../../template/sanitizeConfig";
import { addPrefixOrPostfix } from "../../util/text-util";
import builderEditForm from "./builderEditForm";
import fodselsNummerDNummerSchema from "./schemas/fodselsNummerDNummerSchema";
import firstNameSchema from "./schemas/firstNameSchema";
import surnameSchema from "./schemas/surnameSchema";
import norskVegadresseSchema from "./schemas/norskVegadresseSchema";
import norskPostboksadresseSchema from "./schemas/norskPostboksadresseSchema";
import utenlandskAdresseSchema from "./schemas/utenlandskAdresseSchema";
import vegadresseSchema from "./schemas/vegadresseSchema";
import postnummerSchema from "./schemas/postnummerSchema";
import poststedSchema from "./schemas/poststedSchema";
import utlandLandSchema from "./schemas/utlandLandSchema";
import epostSchema from "./schemas/epostSchema";
import telefonSchema from "./schemas/telefonSchema";
import statsborgerskapSchema from "./schemas/statsborgerskapSchema";
//import { defaultFormFields } from "../../../bygger/src/Forms/DefaultForm";

const postboksPrefix = "postboks";
const utlandPrefix = "utland";

/*const personaliaSchema = (keyPostfix = "") => ({
  label: "Personalia",
  hideLabel: true,
  type: "container",
  key: "personalia",
  input: true,
  components: [fodselsNummerDNummerSchema(keyPostfix), firstNameSchema(keyPostfix), surnameSchema(keyPostfix)],
});*/

/*const komplettKontaktInfoSchema = (keyPostfix = "") => ({
  label: "Komplett kontaktinfo",
  hideLabel: true,
  type: "container",
  key: `komplettKontaktinfo${keyPostfix}`,
  input: true,
  components: [],
});*/

const builderPalett = {
  advanced: null,
  premium: null,
  person: {
    title: "Person",
    components: {
      /*personalia: {
        title: "Personalia",
        key: "personalia",
        icon: "user",
        weight: 0,
        schema: personaliaSchema(),
      },*/
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
      /*komplettKontaktInfo: {
        title: "Komplett kontaktinfo",
        key: "komplettKontaktinfo",
        icon: "home",
        weight: 40,
        schema: komplettKontaktInfoSchema(),
      },*/
      norskVegadresse: {
        title: "Norsk vegadresse",
        icon: "home",
        key: "norskVegadresse",
        weight: 40,
        schema: norskVegadresseSchema(),
      },
      norskPostboksadresse: {
        title: "Norsk postboksadresse",
        key: "norskPostboksadresse",
        icon: "home",
        weight: 40,
        schema: norskPostboksadresseSchema(),
      },
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

const FormBuilderOptions = {
  builder: builderPalett,
  editForm: builderEditForm,
  language: "nb-NO",
  sanitizeConfig: SANITIZE_CONFIG,
};

export default FormBuilderOptions;
