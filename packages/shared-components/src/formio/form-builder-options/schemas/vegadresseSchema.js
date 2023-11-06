const vegadresseSchema = (keyPostfix = '') => ({
  label: 'Vegadresse',
  type: 'textfield',
  key: `vegadresse${keyPostfix}`,
  fieldSize: 'input--xxl',
  autocomplete: 'street-address',
  validate: {
    required: true,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: 'blur',
});

export default vegadresseSchema;
