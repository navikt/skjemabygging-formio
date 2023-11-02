const poststedSchema = (keyPostfix = '') => ({
  label: 'Poststed',
  type: 'textfield',
  key: `poststed${keyPostfix}`,
  autocomplete: 'address-level2',
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

export default poststedSchema;
