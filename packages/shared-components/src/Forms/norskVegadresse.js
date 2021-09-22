const sokerPostfix = "Soker";

export const norskVegadresseSchema = (keyPostfix = "") => ({
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

const vegadresseSchema = (keyPostfix = "") => ({
  label: "Vegadresse",
  type: "textfield",
  key: `vegadresse${keyPostfix}`,
  fieldSize: "input--xxl",
  input: true,
  dataGridLabel: true,
  validateOn: "blur",
  autocomplete: "street-address",
  clearOnHide: true,
  tableView: true,
  validate: {
    required: true,
  },
});

const coAdresseSchema = (keyPostfix = "") => ({
  label: "C/O",
  type: "textfield",
  key: `co${keyPostfix}`,
  fieldSize: "input--xxl",
  input: true,
  dataGridLabel: true,
  validateOn: "blur",
  clearOnHide: true,
  tableView: true,
});

const postnummerSchema = (keyPostfix = "") => ({
  label: "Postnummer",
  type: "textfield",
  key: `postnr${keyPostfix}`,
  autocomplete: "postal-code",
  spellcheck: false,
  fieldSize: "input--xs",
  input: true,
  dataGridLabel: true,
  validateOn: "blur",
  clearOnHide: true,
  tableView: true,
  validate: {
    required: true,
    minLength: 4,
    maxLength: 4,
  },
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
