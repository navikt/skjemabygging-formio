const coAdresseSchema = (keyPostfix = '') => ({
  label: 'C/O',
  type: 'textfield',
  key: `co${keyPostfix}`,
  fieldSize: 'input--xxl',
  autocomplete: false,
  validate: {
    required: false,
  },
  input: true,
  clearOnHide: true,
  dataGridLabel: true,
  tableView: true,
  validateOn: 'blur',
});

export default coAdresseSchema;
