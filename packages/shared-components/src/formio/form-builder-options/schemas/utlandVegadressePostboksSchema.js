const utlandVegadressePostboksSchema = (keyPostfix = '') => ({
  label: 'Vegnavn og husnummer, evt. postboks',
  type: 'textfield',
  key: `postboksNr${keyPostfix}`,
  autocomplete: 'street-address',
  fieldSize: 'input--xxl',
  validate: {
    required: true,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: 'blur',
});

export default utlandVegadressePostboksSchema;
