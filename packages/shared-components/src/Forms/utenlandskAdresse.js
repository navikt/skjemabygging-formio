const sokerPostfix = "Soker";

const utenlandskAdresseSchema = (keyPostfix = "") => ({
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
    coAdresseSchema(sokerPostfix),
    utlandVegadressePostboksSchema(sokerPostfix),
    utlandBygningSchema(sokerPostfix),
    utlandPostkodeSchema(sokerPostfix),
    utlandByStedSchema(sokerPostfix),
    utlandRegionSchema(sokerPostfix),
    utlandLandSchema(sokerPostfix),
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

const utlandVegadressePostboksSchema = (keyPostfix = "") => ({
  label: "Gatenavn og husnummer, evt. postboks",
  type: "textfield",
  key: `utlandVegadressePostboks${keyPostfix}`,
  autocomplete: "street-address",
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

const utlandBygningSchema = (keyPostfix = "") => ({
  label: "Bygning",
  type: "textfield",
  key: `utlandBygning${keyPostfix}`,
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

const utlandPostkodeSchema = (keyPostfix = "") => ({
  label: "Postkode",
  type: "textfield",
  key: `utlandPostkode${keyPostfix}`,
  autocomplete: "postal-code",
  fieldSize: "input--s",
  validate: {
    required: false,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: "blur",
});

const utlandByStedSchema = (keyPostfix = "") => ({
  label: "By / stedsnavn",
  type: "textfield",
  key: `utlandBySted${keyPostfix}`,
  autocomplete: "address-level2",
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

const utlandRegionSchema = (keyPostfix = "") => ({
  label: "Region",
  type: "textfield",
  key: `utlandRegion${keyPostfix}`,
  autocomplete: "address-level1",
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

const utlandLandSchema = (keyPostfix = "") => ({
  label: "Land",
  type: "textfield",
  key: `utlandLand${keyPostfix}`,
  autocomplete: "country-name",
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
