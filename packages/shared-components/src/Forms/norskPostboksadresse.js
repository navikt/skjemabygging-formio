const sokerPostfix = "Soker";

export const norskPostboksadresseSchema = (keyPostfix = "") => ({
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
    {
      label: "Navn på eier av postboksen",
      fieldSize: "input--xxl",
      validateOn: "blur",
      key: "navnPaEierAvPostboksenSoker",
      type: "textfield",
      input: true,
      dataGridLabel: true,
      tableView: true,
    },
    {
      label: "Postboks",
      fieldSize: "input--s",
      key: "postboksSoker",
      type: "textfield",
      input: true,
      dataGridLabel: true,
      tableView: true,
      validateOn: "blur",
      validate: {
        required: true,
      },
    },
    {
      label: "Postnummer",
      fieldSize: "input--xs",
      autocomplete: "postal-code",
      spellcheck: false,
      validateOn: "blur",
      validate: {
        required: true,
        minLength: 4,
        maxLength: 4,
      },
      key: "postboksPostnrSoker",
      type: "textfield",
      input: true,
      dataGridLabel: true,
      tableView: true,
    },
    {
      label: "Poststed",
      fieldSize: "input--xxl",
      autocomplete: "address-level2",
      validateOn: "blur",
      validate: {
        required: true,
      },
      key: "postboksPoststedSoker",
      type: "textfield",
      input: true,
      dataGridLabel: true,
      tableView: true,
    },
  ],
});

const poststedSchema = (keyPostfix = "") => ({
  label: "Poststed",
  type: "textfield",
  key: `poststed${keyPostfix}`,
  autocomplete: "address-level2",
  fieldSize: "input--xxl",
  input: true,
  dataGridLabel: true,
  validateOn: "blur",
  clearOnHide: true,
  tableView: true,
  validate: {
    required: true,
  },
});
