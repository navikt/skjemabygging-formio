import { FormBuilderSchemas } from "@navikt/skjemadigitalisering-shared-components";

const { firstNameSchema, surnameSchema, norskVegadresseSchema, norskPostboksadresseSchema, utenlandskAdresseSchema } =
  FormBuilderSchemas;

const sokerPostfix = "Soker";

export const defaultFormFields = () => [
  {
    type: "panel",
    input: false,
    title: "Veiledning",
    key: "veiledning",
    theme: "default",
    components: [
      {
        label: "Veiledningstekst",
        type: "htmlelement",
        key: "veiledningstekst",
        input: false,
        content: "Her skal det stå litt informasjon om søknaden",
      },
    ],
  },
  {
    type: "panel",
    input: false,
    title: "Dine opplysninger",
    key: "personopplysninger",
    theme: "default",
    components: [
      firstNameSchema(sokerPostfix),
      surnameSchema(sokerPostfix),

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
        label: "Din fødselsdato (dd.mm.åååå)",
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
          norskVegadresseSchema(sokerPostfix),
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
          norskPostboksadresseSchema(sokerPostfix),
          {
            visArvelger: true,
            label: "Gyldig fra og med dato (dd.mm.åååå)",
            key: "gyldigFraDatoDdMmAaaa2",
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
          utenlandskAdresseSchema(sokerPostfix),
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
  },
  {
    type: "panel",
    input: false,
    title: "Vedlegg",
    key: "vedlegg",
    theme: "default",
    components: [
      {
        label: "Annen dokumentasjon",
        description: "Har du noen annen dokumentasjon du ønsker å legge ved?",
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
            label: "Ja, jeg legger det ved denne søknaden.",
          },
          {
            value: "ettersender",
            label: "Jeg ettersender dokumentasjonen senere.",
          },
          {
            value: "nei",
            label: "Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved.",
          },
        ],
      },
    ],
  },
];
