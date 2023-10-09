const utlandPostkodeSchema = (keyPostfix = '') => ({
  label: 'Postkode',
  type: 'textfield',
  key: `postnr${keyPostfix}`,
  autocomplete: 'postal-code',
  fieldSize: 'input--s',
  validate: {
    required: false,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: 'blur',
});

export default utlandPostkodeSchema;
