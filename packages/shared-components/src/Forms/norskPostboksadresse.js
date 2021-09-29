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
    coAdresseSchema(sokerPostfix),
    postboksSchema(sokerPostfix),
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

const postboksSchema = (keyPostfix = "") => ({
  label: "Postboks",
  type: "textfield",
  key: `postboks${keyPostfix}`,
  fieldSize: "input--s",
  validate: {
    required: true,
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
  input: true,
  dataGridLabel: true,
  validateOn: "blur",
  clearOnHide: true,
  tableView: true,
  validate: {
    required: true,
  },
});
