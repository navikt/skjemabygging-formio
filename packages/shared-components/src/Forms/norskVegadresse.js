const sokerPostfix = "Soker";

const norskVegadresseSchema = (keyPostfix = "") => ({
  legend: "Kontaktadresse",
  key: "navSkjemagruppeVegadresse",
  type: "navSkjemagruppe",
  label: "Kontaktadresse",
  input: false,
  tableView: false,
  components: [
    coAdresseSchema(sokerPostfix),
    vegadresseSchema(sokerPostfix),
    postnummerSchema(sokerPostfix),
    poststedSchema(sokerPostfix),
  ],
});

const coAdresseSchema = (keyPostfix = "") => ({
  label: "C/O",
  type: "textfield",
  key: `co${keyPostfix}`,
  fieldSize: "input--xxl",
  validate: {
    required: false,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

const vegadresseSchema = (keyPostfix = "") => ({
  label: "Vegadresse",
  type: "textfield",
  key: `vegadresse${keyPostfix}`,
  fieldSize: "input--xxl",
  autocomplete: "street-address",
  validate: {
    required: true,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

const postnummerSchema = (keyPostfix = "") => ({
  label: "Postnummer",
  type: "textfield",
  key: `postnr${keyPostfix}`,
  autocomplete: "postal-code",
  spellcheck: false,
  fieldSize: "input--xs",
  validate: {
    required: true,
    minLength: 4,
    maxLength: 4,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

const poststedSchema = (keyPostfix = "") => ({
  label: "Poststed",
  type: "textfield",
  key: `poststed${keyPostfix}`,
  autocomplete: "address-level2",
  fieldSize: "input--xxl",
  validate: {
    required: true,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});
